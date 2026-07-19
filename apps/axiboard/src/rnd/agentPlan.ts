import { planFromIntent } from "@axicharts/charts-planner";
import type { DashboardPlan } from "@axicharts/charts-planner";
import {
  createCartesianPanel,
  fieldProfilesToDataProfile,
  PanelSpecGrid,
  planPanelFromMetric,
  validateCartesianSpec,
  type CartesianValidationIssue,
  type DataProfile,
  type PanelSpec,
} from "@axicharts/charts-spec";
import type { LedgerEnrichment } from "./ledgerEnrich";
import { formatRm } from "./ledgerEnrich";

export type AgentDecision = {
  step: string;
  api: string;
  intent?: string;
  status: "ok" | "needs_review" | "validated";
  notes: string;
};

export type AgentChartBlock = {
  panel: PanelSpec;
  rows: Record<string, string | number>[];
  decision: AgentDecision;
  validationIssues: CartesianValidationIssue[];
};

export type AgentPlanResult = {
  dashboardIntent: string;
  dashboardPlan: DashboardPlan;
  kpis: AgentChartBlock[];
  charts: AgentChartBlock[];
  decisions: AgentDecision[];
  dataProfile: DataProfile;
};

const DASHBOARD_INTENT =
  "Finance ledger overview static CSV batch — balance trend, expenses and revenue by category, spend by cost center";

export type AgentPlanOptions = {
  followUpIntents?: string[];
};

function pushDecision(
  decisions: AgentDecision[],
  decision: AgentDecision,
): AgentDecision {
  decisions.push(decision);
  return decision;
}

function ledgerDataProfile(enriched: LedgerEnrichment): DataProfile {
  const base = fieldProfilesToDataProfile(enriched.fieldProfiles);
  return {
    ...base,
    metrics: base.metrics.map((metric) => ({
      ...metric,
      tags: { vertical: "ledger" },
    })),
  };
}

function cartesianBlock(
  decisions: AgentDecision[],
  step: string,
  intent: string,
  rows: Record<string, string | number>[],
  dataProfile: DataProfile,
  options: {
    xField?: string;
    yField?: string;
    title?: string;
  },
): AgentChartBlock {
  const fields = rows.length > 0 ? Object.keys(rows[0]) : (dataProfile.fields ?? []);
  const result = createCartesianPanel({
    intent,
    dataProfile,
    fields,
    xField: options.xField,
    yField: options.yField,
    theme: "clean",
    mode: "interactive",
  });

  const validation = validateCartesianSpec(result.panel, { dataProfile, rows });
  const validationIssues: CartesianValidationIssue[] = validation.ok
    ? validation.warnings
    : validation.errors;

  const decision = pushDecision(decisions, {
    step,
    api: "createCartesianPanel",
    intent,
    status: result.needsReview ? "needs_review" : "validated",
    notes: [
      result.needsReview
        ? `review: ${result.reviewReason ?? "unknown"}`
        : `rules: ${result.matchedRules.join(", ")}`,
      options.yField ? `yField=${options.yField}` : null,
    ]
      .filter(Boolean)
      .join(" · "),
  });

  if (!validation.ok) {
    decision.status = "needs_review";
    decision.notes += ` · errors: ${validation.errors.map((e) => e.code).join(", ")}`;
  }

  return {
    panel: { ...result.panel, title: options.title ?? result.panel.title },
    rows,
    decision,
    validationIssues,
  };
}

function kpiBlock(
  decisions: AgentDecision[],
  step: string,
  label: string,
  field: string,
  value: number,
  dataProfile: DataProfile,
  tone?: "success" | "warning" | "default",
): AgentChartBlock {
  const intent = "kpi headline stat panel ledger";
  const rows = [{ [field]: value }];

  const panel = planPanelFromMetric(
    { name: field, tags: { vertical: "ledger" } },
    { intent, profileFields: dataProfile.fields },
  );

  pushDecision(decisions, {
    step,
    api: "planPanelFromMetric + ledgerRulePack",
    intent,
    status: "ok",
    notes: `Stat KPI — ${label}`,
  });

  return {
    panel: {
      ...panel,
      title: label,
      props: {
        ...panel.props,
        label,
        value: formatRm(value),
        ...(tone ? { tone } : {}),
        monospace: true,
      },
    },
    rows,
    decision: decisions[decisions.length - 1]!,
    validationIssues: [],
  };
}

function buildFollowUpCharts(
  enriched: LedgerEnrichment,
  dataProfile: DataProfile,
  decisions: AgentDecision[],
  followUpIntents: string[],
): AgentChartBlock[] {
  const charts: AgentChartBlock[] = [];
  const joined = followUpIntents.join(" ").toLowerCase();

  if (/payment\s*method|pay\s*method/.test(joined)) {
    charts.push(
      cartesianBlock(
        decisions,
        "Chart — payment method (follow-up)",
        "payment method volume bar chart with value labels",
        enriched.volumeByPaymentMethod,
        dataProfile,
        {
          xField: enriched.fields.paymentMethod,
          yField: "volume",
          title: "Volume by payment method",
        },
      ),
    );
  }

  return charts;
}

/**
 * R&D agent — axicharts APIs only (RFC-003 / C148).
 */
export function agentPlanLedgerDashboard(
  enriched: LedgerEnrichment,
  options: AgentPlanOptions = {},
): AgentPlanResult {
  const decisions: AgentDecision[] = [];
  const followUpIntents = options.followUpIntents ?? [];
  const dataProfile = ledgerDataProfile(enriched);

  pushDecision(decisions, {
    step: "Profile",
    api: "inferFieldRoles + fieldProfilesToDataProfile",
    status: "ok",
    notes: `${enriched.fieldProfiles.length} fields — ${enriched.fieldProfiles
      .map((f) => `${f.name}:${f.role}`)
      .join(", ")}`,
  });

  const dashboardPlan = planFromIntent(dataProfile, DASHBOARD_INTENT);

  pushDecision(decisions, {
    step: "Dashboard shell",
    api: "planFromIntent",
    intent: DASHBOARD_INTENT,
    status: "ok",
    notes: `template ${dashboardPlan.template}, feed ${dashboardPlan.feed}`,
  });

  const kpis: AgentChartBlock[] = [
    kpiBlock(
      decisions,
      "KPI — closing balance",
      "Closing balance",
      "balance",
      enriched.kpis.balance,
      dataProfile,
    ),
    kpiBlock(
      decisions,
      "KPI — total credits",
      "Total credits",
      "totalCredits",
      enriched.kpis.totalCredits,
      dataProfile,
      "success",
    ),
    kpiBlock(
      decisions,
      "KPI — total debits",
      "Total debits",
      "totalDebits",
      enriched.kpis.totalDebits,
      dataProfile,
      "warning",
    ),
    kpiBlock(
      decisions,
      "KPI — net flow",
      "Net flow",
      "netFlow",
      enriched.kpis.netFlow,
      dataProfile,
    ),
  ];

  const charts: AgentChartBlock[] = [
    cartesianBlock(
      decisions,
      "Chart — balance trend",
      "balance line trend over time smooth monotone",
      enriched.byDate,
      dataProfile,
      { xField: enriched.fields.date, yField: enriched.fields.balance, title: "Balance over time" },
    ),
    cartesianBlock(
      decisions,
      "Chart — expenses",
      "expenses bar chart with value labels",
      enriched.expensesByCategory,
      dataProfile,
      { xField: enriched.fields.category, yField: "debit", title: "Expenses by category" },
    ),
    cartesianBlock(
      decisions,
      "Chart — revenue",
      "revenue bar chart with value labels",
      enriched.revenueByCategory,
      dataProfile,
      { xField: enriched.fields.category, yField: "credit", title: "Revenue by category" },
    ),
    cartesianBlock(
      decisions,
      "Chart — cost center",
      "spend bar chart with value labels",
      enriched.spendByCostCenter,
      dataProfile,
      { xField: enriched.fields.costCenter, yField: "spend", title: "Spend by cost center" },
    ),
  ];

  const followUpCharts = buildFollowUpCharts(enriched, dataProfile, decisions, followUpIntents);

  for (const intent of followUpIntents) {
    pushDecision(decisions, {
      step: "Follow-up intent",
      api: "agent interpreter",
      intent,
      status: followUpCharts.length > 0 ? "ok" : "needs_review",
      notes:
        followUpCharts.length > 0
          ? `aggregateRows + createCartesianPanel (${followUpCharts.length} panel)`
          : "No C148 mapping for this follow-up yet",
    });
  }

  return {
    dashboardIntent: DASHBOARD_INTENT,
    dashboardPlan,
    kpis,
    charts: [...charts, ...followUpCharts],
    decisions,
    dataProfile,
  };
}
