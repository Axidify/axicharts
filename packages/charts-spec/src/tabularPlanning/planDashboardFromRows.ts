import type { DomainSemantics } from "../classifyTabularDomain";
import type { VerticalId } from "../rulePacks/types";
import type { DataProfile, PanelSpec } from "../types";
import { classifyTabularDomain, enrichProfileWithDomain } from "../classifyTabularDomain";
import type { ValidationIssue } from "../validatePanel";
import { profileTabular } from "../profileTabular";
import { questionsForVertical } from "./catalogs";
import { enrichTabular } from "./enrich";
import type { TabularEnrichment } from "./enrich/types";
import { applyKpiToRecipe, applyRecipeData, formatKpiDisplay, kpiTone } from "./applyRecipeData";
import { findQuestionsForIntent, rankQuestions } from "./rankQuestions";
import { compileRecipe, questionToRecipe } from "./recipes";
import type { AnalyticalQuestion, Persona, RankQuestionsResult } from "./types";
import type { PanelRecipe } from "./recipes/types";
import { composeLayout, type LayoutPlan } from "./composeLayout";
import { suggestAnalyticsFromProfile } from "./suggestAnalyticsFromProfile";
import { collectFollowUpRecipes } from "./followUpRecipes";
import { detectIncidentTable, suggestIncidentAnalytics } from "./composeIncidentDashboard";
import {
  detectProjectTaskTable,
  suggestProjectTaskAnalytics,
} from "./composeProjectTaskDashboard";
import {
  detectDeviceTelemetryTable,
  suggestDeviceTelemetryAnalytics,
} from "./composeDeviceTelemetryDashboard";
import {
  detectSupportCaseTable,
  suggestSupportCaseAnalytics,
} from "./composeSupportCaseDashboard";
import { classifyTabularPanelAgentStatus } from "./tabularPanelAgentStatus";

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
  validationIssues: ValidationIssue[];
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
  layout?: LayoutPlan;
  planSource?: "l4a" | "l4b";
  /** Question IDs added via follow-up refinement intents (C181). */
  followUpQuestionIds?: string[];
};

export type PlanDashboardFromRowsOptions = {
  persona?: Persona;
  followUpIntents?: string[];
  /** When set, only this intent drives `followUpQuestionIds` (latest chat turn). */
  refinementIntent?: string;
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

/** C170 — cap default panels per dashboard; ranked catalog fills slots first. */
export const PANEL_BUDGET = {
  maxKpis: 4,
  maxCharts: 4,
} as const;

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
      dimensionKey: "cost_center",
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

function compileRecipeBlock(
  recipe: PanelRecipe,
  enrichment: TabularEnrichment,
  dataProfile: DataProfile,
  decisions: TabularPlanDecision[],
  stepPrefix: string,
): TabularPlanBlock | null {
  let bound = applyRecipeData(recipe, enrichment);
  bound = applyKpiToRecipe(bound, enrichment);

  const compiled = compileRecipe(bound, enrichment.derivedRows, { dataProfile });
  let panel = compiled.panel;

  if (recipe.panelType === "stat") {
    const display =
      recipe.kpiValue != null
        ? String(
            Number.isInteger(recipe.kpiValue)
              ? recipe.kpiValue
              : recipe.kpiValue.toLocaleString("en-MY", { maximumFractionDigits: 1 }),
          )
        : formatKpiDisplay(recipe.questionId, recipe.kpiValue ?? 0);
    panel = {
      ...panel,
      title: recipe.title,
      props: {
        ...panel.props,
        label: recipe.kpiLabel ?? recipe.title,
        value: display,
        monospace: true,
      },
    };
  }

  const agentStatus = classifyTabularPanelAgentStatus(panel, compiled.rows, dataProfile);

  pushDecision(decisions, {
    step: `${stepPrefix} — ${recipe.title}`,
    api: recipe.panelType === "stat" ? "compileRecipe + stat" : "compileRecipe",
    intent: recipe.intent,
    status: agentStatus.status,
    notes: agentStatus.notes,
  });

  return {
    questionId: recipe.questionId,
    panel,
    rows: compiled.rows as Array<Record<string, string | number | boolean>>,
    validationIssues: agentStatus.validationIssues,
    decision: decisions[decisions.length - 1]!,
  };
}

function dedupeRecipesByQuestionId(recipes: PanelRecipe[]): PanelRecipe[] {
  const seen = new Set<string>();
  const result: PanelRecipe[] = [];
  for (const recipe of recipes) {
    if (seen.has(recipe.questionId)) continue;
    seen.add(recipe.questionId);
    result.push(recipe);
  }
  return result;
}

function compileGenericDashboard(
  rows: Record<string, unknown>[],
  options: PlanDashboardFromRowsOptions,
  tabularProfile: DataProfile,
  domain: DomainSemantics,
  decisions: TabularPlanDecision[],
): TabularDashboardPlan | null {
  const fieldProfiles = tabularProfile.fieldProfiles ?? [];
  const enrichment: TabularEnrichment = {
    vertical: "ops",
    rows,
    derivedRows: rows,
    fieldProfiles,
    fieldMap: {},
    kpis: { rowCount: rows.length },
    datasets: {},
  };

  const projectTask = detectProjectTaskTable(fieldProfiles);
  const supportCase = detectSupportCaseTable(fieldProfiles);
  const deviceTelemetry = detectDeviceTelemetryTable(fieldProfiles);
  const incident = detectIncidentTable(fieldProfiles);
  const composeApi = projectTask
    ? "composeProjectTaskDashboard"
    : supportCase
      ? "composeSupportCaseDashboard"
      : deviceTelemetry
        ? "composeDeviceTelemetryDashboard"
        : incident
          ? "composeIncidentDashboard"
          : "suggestAnalyticsFromProfile";

  pushDecision(decisions, {
    step: "L4b Generic analytics",
    api: composeApi,
    status: "ok",
    notes: projectTask
      ? `agent project compose · ${rows.length} tasks`
      : supportCase
        ? `agent support compose · ${rows.length} cases`
        : deviceTelemetry
          ? `agent telemetry compose · ${rows.length} readings`
          : incident
            ? `agent incident compose · ${rows.length} tickets`
            : `domain ${domain.vertical} · generic compose path`,
  });

  const recipes = projectTask
    ? suggestProjectTaskAnalytics(rows, fieldProfiles)
    : supportCase
      ? suggestSupportCaseAnalytics(rows, fieldProfiles)
      : deviceTelemetry
        ? suggestDeviceTelemetryAnalytics(rows, fieldProfiles)
        : incident
          ? suggestIncidentAnalytics(rows, fieldProfiles)
          : suggestAnalyticsFromProfile(rows, {
              persona: options.persona,
              dataProfile: tabularProfile,
            });

  const { recipes: followUpRecipes, questionIds: followUpQuestionIds } = collectFollowUpRecipes(
    options.refinementIntent
      ? [options.refinementIntent]
      : (options.followUpIntents ?? []),
    rows,
    fieldProfiles,
    { incident },
  );

  const allFollowUpRecipes =
    options.refinementIntent && options.followUpIntents?.length
      ? collectFollowUpRecipes(options.followUpIntents, rows, fieldProfiles, { incident }).recipes
      : followUpRecipes;

  const mergedRecipes = dedupeRecipesByQuestionId([...recipes, ...allFollowUpRecipes]);

  if (mergedRecipes.length === 0) return null;

  const dataProfile = enrichProfileWithDomain(tabularProfile).profile;
  const persona = options.persona ?? "manager";
  const kpis: TabularPlanBlock[] = [];
  const charts: TabularPlanBlock[] = [];

  for (const recipe of mergedRecipes) {
    const block = compileRecipeBlock(recipe, enrichment, dataProfile, decisions, recipe.panelType === "stat" ? "KPI" : "Chart");
    if (!block) continue;
    if (recipe.panelType === "stat") kpis.push(block);
    else charts.push(block);
  }

  const layout = composeLayout({ kpis, charts }, { dataProfile });
  pushDecision(decisions, {
    step: "L6 Layout",
    api: "composeLayout",
    status: "ok",
    notes: `variant ${layout.variant} · columns ${layout.columns}`,
  });

  return {
    dashboardIntent:
      options.intent ?? `Tabular dashboard — ${domain.vertical === "generic" ? "generic" : domain.vertical}`,
    vertical: "ops",
    persona,
    domain,
    dataProfile,
    enrichment,
    kpis,
    charts,
    decisions,
    layout,
    planSource: "l4b",
    followUpQuestionIds,
  };
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

  const baseRecipe = questionToRecipe(question, enrichment.fieldProfiles, dataProfile);
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

  const agentStatus = classifyTabularPanelAgentStatus(panel, compiled.rows, dataProfile);

  const decision = pushDecision(decisions, {
    step: `${stepPrefix} — ${KPI_LABELS[questionId] ?? recipe.title}`,
    api: recipe.panelType === "stat" ? "compileRecipe + stat" : "compileRecipe",
    intent: recipe.intent,
    status: agentStatus.status,
    notes: agentStatus.notes,
  });

  return {
    questionId,
    panel,
    rows: compiled.rows as Array<Record<string, string | number | boolean>>,
    validationIssues: agentStatus.validationIssues,
    decision,
  };
}

function uniqueIds(ids: string[]): string[] {
  return [...new Set(ids)];
}

function selectQuestionIds(
  defaults: string[],
  ranked: RankQuestionsResult,
  kinds: Array<AnalyticalQuestion["kind"]>,
  limit: number,
): string[] {
  const fromRank = ranked.ranked
    .filter((entry) => kinds.includes(entry.question.kind))
    .map((entry) => entry.question.id);
  return uniqueIds([...defaults, ...fromRank]).slice(0, limit);
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
  const tabularProfile: DataProfile = profileTabular(rows);
  if (options.enrichment?.fieldProfiles) {
    tabularProfile.fieldProfiles = options.enrichment.fieldProfiles;
    tabularProfile.fields = options.enrichment.fieldProfiles.map((field) => field.name);
  }
  const fieldProfiles = tabularProfile.fieldProfiles ?? [];

  pushDecision(decisions, {
    step: "L1 Profile",
    api: "profileTabular",
    status: "ok",
    notes: `${fieldProfiles.length} fields — grain ${tabularProfile.grain ?? "unknown"} · ${
      tabularProfile.timeSpan
        ? `time ${tabularProfile.timeSpan.from}→${tabularProfile.timeSpan.to}`
        : "no time span"
    } · cardinalities ${Object.keys(tabularProfile.cardinalities ?? {}).length}`,
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
    return compileGenericDashboard(rows, options, tabularProfile, domain, decisions);
  }

  const ranked = rankQuestions({
    fieldProfiles,
    domain,
    context: { persona: options.persona },
    kinds: ["chart", "table", "kpi"],
    limit: 12,
    dataProfile: tabularProfile,
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

  const dataProfile = enrichProfileWithDomain(tabularProfile).profile;

  const vertical: VerticalId = enrichment.vertical;
  const dashboardIntent =
    options.intent ?? DASHBOARD_INTENTS[vertical] ?? `Tabular dashboard — ${vertical}`;

  const kpiIds = selectQuestionIds(
    DEFAULT_KPI_IDS[vertical] ?? [],
    ranked,
    ["kpi"],
    PANEL_BUDGET.maxKpis,
  );
  const chartIds = selectQuestionIds(
    DEFAULT_CHART_IDS[vertical] ?? [],
    ranked,
    ["chart", "table"],
    PANEL_BUDGET.maxCharts,
  );

  pushDecision(decisions, {
    step: "Panel budget",
    api: "panelBudget",
    status: "ok",
    notes: `${kpiIds.length} KPIs · ${chartIds.length} charts (max ${PANEL_BUDGET.maxKpis}/${PANEL_BUDGET.maxCharts})`,
  });

  const kpis = kpiIds
    .map((id) => compileQuestionBlock(id, enrichment, dataProfile, decisions, "KPI"))
    .filter((block): block is TabularPlanBlock => block != null);

  const charts = chartIds
    .map((id) => compileQuestionBlock(id, enrichment, dataProfile, decisions, id.includes("table") ? "Table" : "Chart"))
    .filter((block): block is TabularPlanBlock => block != null);

  const seenChartIds = new Set(chartIds);
  const followUpQuestionIds: string[] = [];
  const refinementIntent = options.refinementIntent?.trim();
  const intentsToApply = options.followUpIntents ?? [];

  for (const intent of intentsToApply) {
    const matches = findQuestionsForIntent(intent, vertical);
    const isHighlightIntent = !refinementIntent || intent === refinementIntent;

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
      if (isHighlightIntent) followUpQuestionIds.push(question.id);
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

  const layout = composeLayout({ kpis, charts }, { dataProfile });
  pushDecision(decisions, {
    step: "L6 Layout",
    api: "composeLayout",
    status: "ok",
    notes: `variant ${layout.variant} · columns ${layout.columns}`,
  });

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
    layout,
    planSource: "l4a",
    followUpQuestionIds,
  };
}
