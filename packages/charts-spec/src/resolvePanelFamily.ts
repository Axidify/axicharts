import type { PanelSpec } from "./types";

/** Agent-ready chart families (RFC-004). */
export type AgentChartFamily = "cartesian" | "distribution" | "matrix";

/** Resolved family including non-agent tiers. */
export type PanelFamily = AgentChartFamily | "legacy";

const CARTESIAN_TYPES = new Set([
  "cartesian",
  "blocks",
  "line",
  "bar",
  "area",
  "combo",
]);

const DISTRIBUTION_TYPES = new Set(["pie", "donut", "funnel", "distribution"]);

const MATRIX_TYPES = new Set(["matrix", "heatmap", "calendar", "calendar-heatmap"]);

/**
 * Resolve which chart family a panel belongs to from `type` (and future mark shape).
 * Used by `validatePanel` / `createPanel` orchestrator (RFC-004 C180).
 */
export function resolvePanelFamily(spec: PanelSpec): PanelFamily {
  const type = spec.type;
  if (CARTESIAN_TYPES.has(type)) return "cartesian";
  if (DISTRIBUTION_TYPES.has(type)) return "distribution";
  if (MATRIX_TYPES.has(type)) return "matrix";
  return "legacy";
}

export function isAgentChartFamily(
  family: PanelFamily,
): family is AgentChartFamily {
  return family === "cartesian" || family === "distribution" || family === "matrix";
}
