import type { PanelSpec } from "./types";
import { resolvePanelFamily } from "./resolvePanelFamily";

/** Panel types allowed on agent-runtime paths (RFC-004 + widgets). */
export const AGENT_RUNTIME_PANEL_TYPES = new Set<string>([
  "cartesian",
  "blocks",
  "distribution",
  "matrix",
  "stat",
  "table",
  "markdown",
  "text",
  "navigator",
]);

/** Tier-2 types emitted only by legacy `plan.ts` profile planner — blocked on agent paths. */
export const LEGACY_PROFILE_PLANNER_PANEL_TYPES = new Set<string>([
  "line",
  "area",
  "bar",
  "combo",
  "pie",
  "donut",
  "funnel",
  "gauge",
  "waterfall",
  "candlestick",
  "heatmap",
  "radar",
  "scatter",
  "treemap",
  "sunburst",
]);

export function isAgentRuntimePanelType(type: string): boolean {
  return AGENT_RUNTIME_PANEL_TYPES.has(type);
}

export function isAgentRuntimePanel(panel: PanelSpec): boolean {
  return isAgentRuntimePanelType(panel.type);
}

/**
 * Returns validation issues when a panel is not agent-runtime safe.
 * Legacy profile planner types (donut, gauge, waterfall, …) fail here.
 */
export function agentRuntimePanelIssues(panel: PanelSpec): Array<{
  code: string;
  path: string;
  message: string;
}> {
  if (isAgentRuntimePanel(panel)) {
    return [];
  }
  const family = resolvePanelFamily(panel);
  return [
    {
      code: "LEGACY_PROFILE_PLANNER_PANEL",
      path: "type",
      message: `Panel type "${panel.type}" is legacy profile-planner output (family: ${family})`,
    },
  ];
}
