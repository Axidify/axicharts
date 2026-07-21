import type { AgentChartFamily } from "./resolvePanelFamily";

const CARTESIAN_CHART_INTENT_RE =
  /\b(bar charts?|line charts?|area charts?|histograms?)\b/i;
const DISTRIBUTION_CHART_INTENT_RE =
  /\b(pie charts?|donut charts?|doughnut charts?|funnels?)\b/i;
const MATRIX_CHART_INTENT_RE =
  /\b(heat\s*maps?|heatmaps?|correlation\s+matrix)\b/i;

/**
 * Agent families explicitly named in NL intent (chart-type phrases only).
 * Used to flag cross-family contradictions before a single-family planner runs.
 */
export function intentAgentFamilies(intent: string): AgentChartFamily[] {
  const families: AgentChartFamily[] = [];
  if (CARTESIAN_CHART_INTENT_RE.test(intent)) families.push("cartesian");
  if (DISTRIBUTION_CHART_INTENT_RE.test(intent)) families.push("distribution");
  if (MATRIX_CHART_INTENT_RE.test(intent)) families.push("matrix");
  return families;
}

export function detectIntentFamilyConflict(intent: string): boolean {
  return intentAgentFamilies(intent).length >= 2;
}
