import type { DomainSemantics } from "../classifyTabularDomain";
import type { VerticalId } from "../rulePacks/types";
import type { DataProfile, FieldProfile, PanelSpec } from "../types";
import { classifyTabularDomain, enrichProfileWithDomain } from "../classifyTabularDomain";
import { validateCartesianSpec, type CartesianValidationIssue } from "../cartesianValidation";
import { fieldProfilesToDataProfile, inferFieldRoles } from "../inferFieldRoles";
import { questionsForVertical } from "./catalogs";
import { enrichTabular } from "./enrich";
import type { TabularEnrichment } from "./enrich/types";
import { applyKpiToRecipe, applyRecipeData, formatKpiDisplay, kpiTone } from "./applyRecipeData";
import { findQuestionsForIntent, rankQuestions } from "./rankQuestions";
import { compileRecipe, questionToRecipe } from "./recipes";
import type { AnalyticalQuestion, Persona } from "./types";

export type TabularPlanDecision = {
  step: string;
  api: string;
  intent?: string;
  status: "ok" | "needs_review" | "validated";
  notes: string;
};

export type TabularPlanBlock = {
  questionId: string;
  panel: PanelSpec;
  rows: Array<Record<string, string | number | boolean>>;
  validationIssues: CartesianValidationIssue[];
  decision: TabularPlanDecision;
};

export type TabularDashboardPlan = {
  dashboardIntent: string;
  vertical: VerticalId;
  persona: Persona;
  domain: DomainSemantics;
  dataProfile: DataProfile;
  enrichment: TabularEnrichment;
  kpis: TabularPlanBlock[];
  charts: TabularPlanBlock[];
  decisions: TabularPlanDecision[];
};

export type PlanDashboardFromRowsOptions = {
  persona?: Persona;
  followUpIntents?: string[];
  enrichment?: TabularEnrichment;
  intent?: string;
};

const DASHBOARD_INTENTS: Partial<Record<VerticalId, string>> = {
  sales:
    "Sales pipeline dashboard static CSV — value by stage, weighted forecast by salesperson",
  ledger:
    "Finance ledger overview static CSV batch — balance trend, expenses and revenue by category, spend by cost center",
  attendance: "Attendance dashboard static CSV — hours by department, status breakdown, timesheet table",
};

const DEFAULT_KPI_IDS: Partial<Record<VerticalId, string[]>> = {
  sales: [
    "sales.kpi.total_pipeline",
    "sales.kpi.weighted_forecast",
    "sales.kpi.closed_won",
    "sales.kpi.open_deals",
  ],
  ledger: [
    "ledger.kpi.balance",
    "ledger.kpi.total_credits",
    "ledger.kpi.total_debits",
    "ledger.kpi.net_flow",
  ],
  attendance: [
    "attendance.kpi.total_hours",
    "attendance.kpi.present",
    "attendance.kpi.leave",
    "attendance.kpi.avg_hours_present",
  ],
};

const DEFAULT_CHART_IDS: Partial<Record<VerticalId, string[]>> = {
  sales: ["sales.table.opportunities", "sales.chart.by_stage", "sales.chart.weighted_forecast"],
  ledger: [
    "ledger.chart.balance_trend",
    "ledger.chart.expenses",
    "ledger.chart.revenue",
    "ledger.chart.cost_center",
  ],
  attendance: [
    "attendance.table.log",
    "attendance.chart.hours_by_department",
    "attendance.chart.status",
  ],
};

const KPI_LABELS: Record<string, string> = {
  "sales.kpi.total_pipeline": "Total pipeline",
  "sales.kpi.weighted_forecast": "Weighted forecast",
  "sales.kpi.closed_won": "Closed won",
  "sales.kpi.open_deals": "Open deals",
  "ledger.kpi.balance": "Closing balance",
  "ledger.kpi.total_credits": "Total credits",
  "ledger.kpi.total_debits": "Total debits",
  "ledger.kpi.net_flow": "Net flow",
  "attendance.kpi.total_hours": "Total hours",
  "attendance.kpi.present": "Present",
  "attendance.kpi.leave": "On leave",
  "attendance.kpi.avg_hours_present": "Avg hours (present)",
};

function pushDecision(
  decisions: TabularPlanDecision[],
  decision: TabularPlanDecision,
): TabularPlanDecision {
  decisions.push(decision);
  return decision;
}

function syntheticQuestion(questionId: string, vertical: VerticalId): AnalyticalQuestion | undefined {
  if (questionId === "ledger.chart.cost_center") {
    return {
      id: "ledger.chart.cost_center",
      text: "Spend by cost center",
      intent: "spend bar chart with value labels",
      verticals: ["ledger"],
      personas: ["manager"],
      basePriority: 7,
      kind: "chart",
    };
  }
  if (questionId.startsWith("ledger.kpi.total_") || questionId === "attendance.kpi.avg_hours_present") {
    return {
      id: questionId,
      text: KPI_LABELS[questionId] ?? questionId,
      intent: `kpi headline stat panel ${vertical}`,
      verticals: [vertical],
      personas: ["manager"],
      basePriority: 7,
      kind: "kpi",
    };
  }
  return undefined;
}

function compileQuestionBlock(
  questionId: string,
  enrichment: TabularEnrichment,
  dataProfile: DataProfile,
  decisions: TabularPlanDecision[],
  stepPrefix: string,
): TabularPlanBlock | null {
  const question =
    questionsForVertical(enrichment.vertical).find((entry) => entry.id === questionId) ??
    syntheticQuestion(questionId, enrichment.vertical);

  if (!question) return null;

  const baseRecipe = questionToRecipe(question, enrichment.fieldProfiles);
  if (!baseRecipe) return null;

  let recipe = applyRecipeData(baseRecipe, enrichment);
  recipe = applyKpiToRecipe(recipe, enrichment);

  const compiled = compileRecipe(recipe, enrichment.derivedRows, { dataProfile });
  let panel = compiled.panel;

  if (recipe.panelType === "stat") {
    const display = formatKpiDisplay(questionId, recipe.kpiValue ?? 0);
    const tone = kpiTone(questionId);
    panel = {
      ...panel,
      title: KPI_LABELS[questionId] ?? recipe.title,
      props: {
        ...panel.props,
        label: KPI_LABELS[questionId] ?? recipe.title,
        value: display,
        ...(tone ? { tone } : {}),
        monospace: true,
      },
    };
  }

  const validationIssues: CartesianValidationIssue[] = [];
  let status: TabularPlanDecision["status"] = "validated";
  let notes = `panel: ${panel.type}`;

  if (panel.type === "cartesian") {
    const validation = validateCartesianSpec(panel, { dataProfile, rows: compiled.rows });
    validationIssues.push(...(validation.ok ? validation.warnings : validation.errors));
    if (!validation.ok) {
      status = "needs_review";
      notes += ` · errors: ${validation.errors.map((issue) => issue.code).join(", ")}`;
    } else if (validation.warnings.length > 0) {
      notes += ` · warnings: ${validation.warnings.length}`;
    }
  } else if (panel.type === "stat") {
    status = "ok";
    notes = `Stat KPI — ${KPI_LABELS[questionId] ?? recipe.title}`;
  } else if (panel.type === "table") {
    status = "ok";
    notes = `${compiled.rows.length} rows`;
  } else if (panel.type === "funnel") {
    notes = "geometry: stage funnel";
  }

  const decision = pushDecision(decisions, {
    step: `${stepPrefix} — ${KPI_LABELS[questionId] ?? recipe.title}`,
    api: recipe.panelType === "stat" ? "compileRecipe + stat" : "compileRecipe",
    intent: recipe.intent,
    status,
    notes,
  });

  return {
    questionId,
    panel,
    rows: compiled.rows as Array<Record<string, string | number | boolean>>,
    validationIssues,
    decision,
  };
}

function uniqueIds(ids: string[]): string[] {
  return [...new Set(ids)];
}

/**
 * C157 — unified tabular dashboard planner (L2–L5 pipeline).
 */
export function planDashboardFromRows(
  rows: Record<string, unknown>[],
  options: PlanDashboardFromRowsOptions = {},
): TabularDashboardPlan | null {
  if (rows.length === 0) return null;

  const decisions: TabularPlanDecision[] = [];
  const fieldProfiles: FieldProfile[] = options.enrichment?.fieldProfiles ?? inferFieldRoles(rows);

  pushDecision(decisions, {
    step: "Profile",
    api: "inferFieldRoles + fieldProfilesToDataProfile",
    status: "ok",
    notes: `${fieldProfiles.length} fields — ${fieldProfiles
      .map((field) => `${field.name}:${field.role}`)
      .join(", ")}`,
  });

  const domain = classifyTabularDomain({ fieldProfiles });
  pushDecision(decisions, {
    step: "Domain",
    api: "classifyTabularDomain",
    status: domain.needsReview ? "needs_review" : "ok",
    notes: domain.needsReview
      ? `vertical ${domain.vertical} · confidence ${Math.round(domain.confidence * 100)}% · signals: ${domain.signals.slice(0, 4).join(", ") || "weak match"}`
      : `vertical ${domain.vertical} · confidence ${Math.round(domain.confidence * 100)}%`,
  });
  const enrichment = options.enrichment ?? enrichTabular(rows, domain);

  if (!enrichment) {
    pushDecision(decisions, {
      step: "Enrich",
      api: "enrichTabular",
      status: "needs_review",
      notes: `No enrichment for vertical ${domain.vertical}`,
    });
    return null;
  }

  const ranked = rankQuestions({
    fieldProfiles,
    domain,
    context: { persona: options.persona },
    kinds: ["chart", "table", "kpi"],
    limit: 12,
  });

  pushDecision(decisions, {
    step: "Question catalog",
    api: "rankQuestions",
    status: "ok",
    notes: `persona ${ranked.persona} · domain ${domain.vertical} · top: ${ranked.ranked
      .slice(0, 4)
      .map((entry) => entry.question.id)
      .join(", ")}`,
  });

  const dataProfile = enrichProfileWithDomain({
    ...fieldProfilesToDataProfile(fieldProfiles),
    fieldProfiles,
  }).profile;

  const vertical: VerticalId = enrichment.vertical;
  const dashboardIntent =
    options.intent ?? DASHBOARD_INTENTS[vertical] ?? `Tabular dashboard — ${vertical}`;

  const kpiIds = uniqueIds(DEFAULT_KPI_IDS[vertical] ?? []);
  const chartIds = uniqueIds(DEFAULT_CHART_IDS[vertical] ?? []);

  const kpis = kpiIds
    .map((id) => compileQuestionBlock(id, enrichment, dataProfile, decisions, "KPI"))
    .filter((block): block is TabularPlanBlock => block != null);

  const charts = chartIds
    .map((id) => compileQuestionBlock(id, enrichment, dataProfile, decisions, id.includes("table") ? "Table" : "Chart"))
    .filter((block): block is TabularPlanBlock => block != null);

  const seenChartIds = new Set(chartIds);
  for (const intent of options.followUpIntents ?? []) {
    const matches = findQuestionsForIntent(intent, vertical);
    pushDecision(decisions, {
      step: "Follow-up intent",
      api: "findQuestionsForIntent",
      intent,
      status: matches.length > 0 ? "ok" : "needs_review",
      notes:
        matches.length > 0
          ? matches.map((question) => question.id).join(" · ")
          : `No catalog mapping for vertical ${vertical}`,
    });

    for (const question of matches) {
      if (seenChartIds.has(question.id)) continue;
      seenChartIds.add(question.id);
      const block = compileQuestionBlock(
        question.id,
        enrichment,
        dataProfile,
        decisions,
        "Follow-up",
      );
      if (block) charts.push(block);
    }
  }

  return {
    dashboardIntent,
    vertical,
    persona: ranked.persona,
    domain,
    dataProfile,
    enrichment,
    kpis,
    charts,
    decisions,
  };
}
