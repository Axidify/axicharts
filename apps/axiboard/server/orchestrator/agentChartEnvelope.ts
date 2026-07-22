import { validatePanel, type PanelSpec } from "@axicharts/charts-spec";
import { toUserFacingHints } from "@axicharts/charts-spec/planning";

export type AgentChartVisualizationHint = "chart" | "table" | "none";

/** RFC-005 frozen envelope for chat / activity payloads. */
export type AgentChartEnvelope = {
  specVersion: 1;
  visualizationHint: AgentChartVisualizationHint;
  panel: PanelSpec;
  data: Record<string, unknown>[];
};

/** RFC-005 structured validation error for non-envelope responses. */
export type AgentChartSpecError = {
  error: "invalid_chart_spec";
  hints: string[];
  codes: string[];
};

export function visualizationHintForPanel(panel: PanelSpec): AgentChartVisualizationHint {
  if (panel.type === "table") return "table";
  if (panel.type === "stat" || panel.type === "kpi" || panel.type === "digital") return "none";
  if (panel.type === "cartesian" || panel.type === "distribution" || panel.type === "matrix") {
    return "chart";
  }
  return "none";
}

export function buildAgentChartEnvelope(
  panel: PanelSpec,
  rows: Record<string, unknown>[],
): AgentChartEnvelope | AgentChartSpecError {
  const validation = validatePanel(panel, { rows, strict: true });
  if (!validation.ok) {
    return {
      error: "invalid_chart_spec",
      hints: toUserFacingHints(validation.errors),
      codes: validation.errors.map((issue) => issue.code),
    };
  }

  return {
    specVersion: 1,
    visualizationHint: visualizationHintForPanel(validation.spec),
    panel: validation.spec,
    data: rows,
  };
}

/** Attach RFC-005 envelope (or spec error) to a planner block for API consumers. */
export function withAgentChartEnvelope<T extends { panel: PanelSpec; rows: Record<string, unknown>[] }>(
  block: T,
): T & { envelope?: AgentChartEnvelope; chartSpecError?: AgentChartSpecError } {
  const wrapped = buildAgentChartEnvelope(block.panel, block.rows);
  if ("error" in wrapped) {
    return {
      ...block,
      chartSpecError: wrapped,
    };
  }
  return {
    ...block,
    envelope: wrapped,
  };
}
