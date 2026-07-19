import type { McpPlanDashboardResult } from "@axicharts/charts-mcp";
import type { OrchestratorPlanResult } from "../types";

/** Serializable plan contract — MCP plan_dashboard ≡ orchestrator /plan. */
export type GoldenPlanSnapshot = {
  vertical: string;
  persona: string;
  domainVertical: string;
  dashboardIntent: string;
  summary: {
    kpiCount: number;
    chartCount: number;
    needsReview: boolean;
  };
  kpiQuestionIds: string[];
  chartQuestionIds: string[];
  kpiPanelTypes: string[];
  chartPanelTypes: string[];
  decisionSteps: string[];
  decisionApis: string[];
  decisionStatuses: string[];
  validationIssueCount: number;
};

type BlockLike = {
  questionId?: string;
  panel: { type: string };
  validationIssues: unknown[];
  decision: { step: string; api: string; status: string };
};

function blockQuestionId(block: BlockLike, index: number, kind: "kpi" | "chart"): string {
  return block.questionId ?? `${kind}-${index}`;
}

function snapshotFromBlocks(input: {
  vertical: string;
  persona: string;
  domainVertical: string;
  dashboardIntent: string;
  summary: GoldenPlanSnapshot["summary"];
  kpis: BlockLike[];
  charts: BlockLike[];
  decisions: Array<{ step: string; api: string; status: string }>;
}): GoldenPlanSnapshot {
  const blocks = [...input.kpis, ...input.charts];
  return {
    vertical: input.vertical,
    persona: input.persona,
    domainVertical: input.domainVertical,
    dashboardIntent: input.dashboardIntent,
    summary: input.summary,
    kpiQuestionIds: input.kpis.map((block, index) => blockQuestionId(block, index, "kpi")),
    chartQuestionIds: input.charts.map((block, index) => blockQuestionId(block, index, "chart")),
    kpiPanelTypes: input.kpis.map((block) => block.panel.type),
    chartPanelTypes: input.charts.map((block) => block.panel.type),
    decisionSteps: input.decisions.map((entry) => entry.step),
    decisionApis: input.decisions.map((entry) => entry.api),
    decisionStatuses: input.decisions.map((entry) => entry.status),
    validationIssueCount: blocks.reduce((sum, block) => sum + block.validationIssues.length, 0),
  };
}

export function snapshotFromMcp(result: McpPlanDashboardResult): GoldenPlanSnapshot {
  return snapshotFromBlocks({
    vertical: result.vertical,
    persona: result.persona,
    domainVertical: result.domain.vertical,
    dashboardIntent: result.dashboardIntent,
    summary: {
      kpiCount: result.summary.kpiCount,
      chartCount: result.summary.chartCount,
      needsReview: result.summary.needsReview,
    },
    kpis: result.kpis,
    charts: result.charts,
    decisions: result.decisions,
  });
}

export function snapshotFromOrchestrator(result: OrchestratorPlanResult): GoldenPlanSnapshot {
  return snapshotFromBlocks({
    vertical: result.vertical,
    persona: result.persona,
    domainVertical: result.vertical,
    dashboardIntent: result.dashboardIntent,
    summary: result.summary,
    kpis: result.kpis,
    charts: result.charts,
    decisions: result.decisions,
  });
}
