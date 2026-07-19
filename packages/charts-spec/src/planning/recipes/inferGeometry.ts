import type { ChartGeometry, GeometryInput } from "./types";
import { roleOf } from "./types";

/**
 * C158 — deterministic chart geometry from question shape + field roles.
 */
export function inferChartGeometry(input: GeometryInput): ChartGeometry {
  const rules: string[] = [];
  const intent = input.intent.toLowerCase();

  if (input.kind === "kpi") {
    rules.push("geometry:kpi-stat");
    return { panelType: "stat", rules };
  }

  if (input.kind === "table") {
    rules.push("geometry:table");
    return { panelType: "table", rules };
  }

  if (/waterfall|bridge|variance|walk/.test(intent)) {
    rules.push("geometry:waterfall");
    return { panelType: "waterfall", rules };
  }

  const xRole = input.xField ? roleOf(input.fieldProfiles, input.xField) : undefined;
  if (
    xRole === "time" ||
    /over\s*time|trend|time\s*series|monotone/.test(intent)
  ) {
    rules.push("geometry:time-line");
    return { panelType: "cartesian", markType: "line", rules };
  }

  if (
    input.yFields &&
    input.yFields.length >= 2 &&
    input.yFields.some((f) => /debit/i.test(f)) &&
    input.yFields.some((f) => /credit/i.test(f))
  ) {
    rules.push("geometry:stacked-debit-credit");
    return {
      panelType: "cartesian",
      markType: "bar",
      orientation: "vertical",
      rules,
    };
  }

  if (input.dimensionKey === "stage") {
    rules.push("geometry:stage-funnel");
    return { panelType: "funnel", rules };
  }

  if (/area|cumulative|mrr/.test(intent)) {
    rules.push("geometry:area");
    return { panelType: "cartesian", markType: "area", rules };
  }

  rules.push("geometry:nominal-bar");
  return {
    panelType: "cartesian",
    markType: "bar",
    orientation: "vertical",
    rules,
  };
}
