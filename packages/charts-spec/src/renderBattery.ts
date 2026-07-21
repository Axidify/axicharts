/**
 * Render battery — mount compiled panels in jsdom and classify pass / fail / crash.
 * Complements composition/distribution/matrix simulations (compile-only).
 */

export type RenderSurface =
  | "uplot"
  | "echarts"
  | "svg"
  | "cartesian"
  | "kpi"
  | "table"
  | "plugin"
  | "any";

export type RenderBatteryExpect = "pass" | "compile_throw";

export type RenderBatteryCase = {
  id: string;
  group: string;
  description: string;
  panel: import("./types").PanelSpec;
  rows: Record<string, unknown>[];
  width?: number;
  height?: number;
  expect: RenderBatteryExpect;
  surface?: RenderSurface;
  /** Industrial / community plugin types need registerBuiltinChartTypes(). */
  registerPlugins?: boolean;
  /** When all values are zero/empty, accept ChartContainer empty-state overlay instead of a chart surface. */
  emptyStateOk?: boolean;
};

export type RenderBatteryOutcome = "pass" | "fail" | "crash";

export type RenderBatteryResult = {
  id: string;
  group: string;
  expect: RenderBatteryExpect;
  outcome: RenderBatteryOutcome;
  details: string;
};

const SURFACE_SELECTORS: Record<Exclude<RenderSurface, "any" | "cartesian">, string> = {
  uplot: ".axicharts-uplot",
  echarts: ".axicharts-echarts",
  svg: '[data-engine="svg"]',
  kpi: ".axicharts-stat-delta, .axicharts-stat, [data-axi-stat]",
  table: "table",
  plugin: "[data-axi-plugin], .axicharts-plugin, .axicharts-tank, .axicharts-geo, .axicharts-sankey, .axicharts-gantt",
};

export function hasEmptyStateOverlay(container: HTMLElement): boolean {
  return Boolean(container.querySelector(".axicharts-state-overlay"));
}

export function detectRenderSurface(container: HTMLElement): RenderSurface | null {
  if (container.querySelector(SURFACE_SELECTORS.uplot)) return "uplot";
  if (container.querySelector(SURFACE_SELECTORS.echarts)) return "echarts";
  if (container.querySelector(SURFACE_SELECTORS.svg)) return "svg";
  if (container.querySelector(SURFACE_SELECTORS.kpi)) return "kpi";
  if (container.querySelector(SURFACE_SELECTORS.table)) return "table";
  if (container.querySelector(SURFACE_SELECTORS.plugin)) return "plugin";
  if (container.querySelector("canvas")) return "uplot";
  if (container.querySelector("svg")) return "svg";
  return null;
}

export function checkRenderSurface(
  container: HTMLElement,
  expected: RenderSurface,
): { ok: boolean; details: string } {
  const found = detectRenderSurface(container);
  if (expected === "any") {
    return found
      ? { ok: true, details: `surface=${found}` }
      : { ok: false, details: "no chart surface in DOM" };
  }
  if (expected === "cartesian") {
    const ok = found === "uplot" || found === "svg";
    return ok
      ? { ok: true, details: `surface=${found}` }
      : { ok: false, details: `expected cartesian (uplot|svg), found=${found ?? "none"}` };
  }
  if (found === expected) {
    return { ok: true, details: `surface=${found}` };
  }
  return {
    ok: false,
    details: `expected surface=${expected}, found=${found ?? "none"}`,
  };
}

export function summarizeRenderBattery(results: RenderBatteryResult[]): {
  pass: number;
  fail: number;
  crash: number;
  compile_throw_ok: number;
  compile_throw_miss: number;
  failures: RenderBatteryResult[];
} {
  let pass = 0;
  let fail = 0;
  let crash = 0;
  let compile_throw_ok = 0;
  let compile_throw_miss = 0;
  const failures: RenderBatteryResult[] = [];

  for (const result of results) {
    if (result.expect === "compile_throw") {
      if (result.outcome === "pass") compile_throw_ok++;
      else {
        compile_throw_miss++;
        failures.push(result);
      }
      continue;
    }
    if (result.outcome === "pass") pass++;
    else if (result.outcome === "crash") crash++;
    else fail++;
    if (result.outcome !== "pass") failures.push(result);
  }

  return { pass, fail, crash, compile_throw_ok, compile_throw_miss, failures };
}
