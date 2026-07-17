import type { PanelSpec, TemplateId } from "@axicharts/charts-spec";
import { SPEC_VERSION } from "@axicharts/charts-spec";
import type { DashboardPlan } from "./types";

const MOSAIC_PRESET_IDS = new Set<string>([
  "ops-finance",
  "ops-overview",
  "trading-program",
  "command-center",
]);

const TEMPLATE_IDS = new Set<string>([
  "finance-pnl",
  "trading-blotter",
  "capacity-grid",
  "ops-2x2",
  "line-overview",
  "plugins-wall",
  "program-dashboard",
]);

const PANEL_TYPES = new Set([
  "line",
  "area",
  "bar",
  "pie",
  "donut",
  "funnel",
  "waterfall",
  "candlestick",
  "heatmap",
  "scatter",
  "treemap",
  "stat",
  "gauge",
  "table",
]);

const THEMES = new Set(["clean", "live", "industrial", "presentation"]);
const MODES = new Set(["static", "interactive", "live", "presentation"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isTemplateId(value: string): value is TemplateId {
  return TEMPLATE_IDS.has(value);
}

export function validatePanelSpec(raw: unknown): PanelSpec | null {
  if (!isRecord(raw) || typeof raw.type !== "string") return null;
  if (!PANEL_TYPES.has(raw.type) && !raw.type) return null;

  const version = raw.specVersion;
  if (version != null && version !== SPEC_VERSION) return null;

  return {
    specVersion: SPEC_VERSION,
    ...(raw as PanelSpec),
  };
}

export function validatePanelSpecs(raw: unknown): PanelSpec[] | null {
  if (!Array.isArray(raw)) return null;
  const panels: PanelSpec[] = [];
  for (const item of raw) {
    const panel = validatePanelSpec(item);
    if (!panel) return null;
    panels.push(panel);
  }
  return panels.length > 0 ? panels : null;
}

export function validateDashboardPlan(raw: unknown): DashboardPlan | null {
  if (!isRecord(raw) || typeof raw.template !== "string" || !isTemplateId(raw.template)) {
    return null;
  }

  const panels = validatePanelSpecs(raw.panels);
  if (!panels) return null;

  const layout = raw.layout === "mosaic" ? "mosaic" : "embed";
  const feed = raw.feed === "static" ? "static" : "historian";
  const theme = typeof raw.theme === "string" && THEMES.has(raw.theme) ? raw.theme : undefined;
  const mode = typeof raw.mode === "string" && MODES.has(raw.mode) ? raw.mode : undefined;
  const mosaicPreset =
    typeof raw.mosaicPreset === "string" && MOSAIC_PRESET_IDS.has(raw.mosaicPreset)
      ? (raw.mosaicPreset as DashboardPlan["mosaicPreset"])
      : undefined;

  return {
    source: "llm",
    template: raw.template,
    title: typeof raw.title === "string" ? raw.title : undefined,
    subtitle: typeof raw.subtitle === "string" ? raw.subtitle : undefined,
    theme,
    mode,
    layout,
    feed,
    presentation: raw.presentation === true || mode === "presentation",
    mosaicPreset,
    panels,
    warnings: Array.isArray(raw.warnings)
      ? raw.warnings.filter((item): item is string => typeof item === "string")
      : undefined,
  };
}

export function parsePlannerJson(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const payload = fenced?.[1]?.trim() ?? trimmed;
  return JSON.parse(payload) as unknown;
}
