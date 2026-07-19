import { planDashboardFromRows, type PlannerDashboardPlan } from "@axicharts/charts-planner/tabular";
import type { Persona } from "@axicharts/charts-spec";
import type { AgentChartBlock, OrchestratorPlanResult } from "../types";

function mapBlock(block: PlannerDashboardPlan["kpis"][number]): AgentChartBlock {
  return {
    questionId: block.questionId,
    panel: block.panel,
    rows: block.rows,
    decision: block.decision,
    validationIssues: block.validationIssues,
  };
}

export function runTabularPlan(
  rows: Record<string, unknown>[],
  options: {
    persona?: Persona;
    followUpIntents?: string[];
    intent?: string;
  } = {},
): OrchestratorPlanResult | null {
  const plan = planDashboardFromRows(rows, options);
  if (!plan) return null;

  const blocks = [...plan.kpis, ...plan.charts];
  const needsReview =
    plan.decisions.some((decision) => decision.status === "needs_review") ||
    blocks.some((block) => block.validationIssues.length > 0);

  return {
    dashboardIntent: plan.dashboardIntent,
    dashboardPlan: plan.dashboardPlan,
    kpis: plan.kpis.map(mapBlock),
    charts: plan.charts.map(mapBlock),
    decisions: plan.decisions,
    dataProfile: plan.dataProfile,
    persona: plan.persona,
    vertical: plan.vertical,
    domain: plan.domain,
    layout: plan.layout,
    planSource: plan.planSource,
    summary: {
      kpiCount: plan.kpis.length,
      chartCount: plan.charts.length,
      needsReview,
    },
  };
}
