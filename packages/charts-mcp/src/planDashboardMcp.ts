import {
  rankQuestions,
  type Persona,
  type TabularPlanBlock,
} from "@axicharts/charts-spec/planning";
import {
  planDashboardFromRows,
  type PlannerDashboardPlan,
} from "@axicharts/charts-planner/tabular";

export type McpDashboardBlock = {
  questionId: string;
  panel: TabularPlanBlock["panel"];
  rows: TabularPlanBlock["rows"];
  validationIssues: TabularPlanBlock["validationIssues"];
  decision: TabularPlanBlock["decision"];
};

export type McpPlanDashboardResult = {
  ok: true;
  schema: string;
  persona: Persona;
  vertical: PlannerDashboardPlan["vertical"];
  domain: PlannerDashboardPlan["domain"];
  dashboardIntent: string;
  dashboardPlan: PlannerDashboardPlan["dashboardPlan"];
  dataProfile: PlannerDashboardPlan["dataProfile"];
  questions: ReturnType<typeof rankQuestions>;
  kpis: McpDashboardBlock[];
  charts: McpDashboardBlock[];
  decisions: PlannerDashboardPlan["decisions"];
  summary: {
    kpiCount: number;
    chartCount: number;
    decisionCount: number;
    needsReview: boolean;
  };
};

function serializeBlock(block: TabularPlanBlock): McpDashboardBlock {
  return {
    questionId: block.questionId,
    panel: block.panel,
    rows: block.rows,
    validationIssues: block.validationIssues,
    decision: block.decision,
  };
}

function buildSummary(plan: PlannerDashboardPlan): McpPlanDashboardResult["summary"] {
  const blocks = [...plan.kpis, ...plan.charts];
  const needsReview =
    plan.decisions.some((decision) => decision.status === "needs_review") ||
    blocks.some((block) => block.validationIssues.length > 0);

  return {
    kpiCount: plan.kpis.length,
    chartCount: plan.charts.length,
    decisionCount: plan.decisions.length,
    needsReview,
  };
}

export function planDashboardForMcp(
  rows: Record<string, unknown>[],
  options: {
    intent?: string;
    persona?: Persona;
    followUpIntents?: string[];
  },
  schemaUrl: string,
): McpPlanDashboardResult | { ok: false; error: string } {
  const plan = planDashboardFromRows(rows, {
    intent: options.intent,
    persona: options.persona,
    followUpIntents: options.followUpIntents,
  });

  if (!plan) {
    return {
      ok: false,
      error: "planDashboardFromRows returned null — unsupported or empty tabular data",
    };
  }

  const fieldProfiles = plan.dataProfile.fieldProfiles ?? [];
  const questions = rankQuestions({
    fieldProfiles,
    domain: plan.domain,
    context: { persona: options.persona ?? plan.persona, intent: options.intent },
    kinds: ["chart", "table", "kpi"],
    limit: 12,
  });

  return {
    ok: true,
    schema: schemaUrl,
    persona: plan.persona,
    vertical: plan.vertical,
    domain: plan.domain,
    dashboardIntent: plan.dashboardIntent,
    dashboardPlan: plan.dashboardPlan,
    dataProfile: plan.dataProfile,
    questions,
    kpis: plan.kpis.map(serializeBlock),
    charts: plan.charts.map(serializeBlock),
    decisions: plan.decisions,
    summary: buildSummary(plan),
  };
}
