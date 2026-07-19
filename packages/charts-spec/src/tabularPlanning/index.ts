export type {
  AnalyticalQuestion,
  Persona,
  PlanningContext,
  QuestionRequires,
  RankedQuestion,
  RankQuestionsInput,
  RankQuestionsResult,
} from "./types";
export {
  ALL_TABULAR_QUESTIONS,
  ATTENDANCE_QUESTIONS,
  LEDGER_QUESTIONS,
  SALES_QUESTIONS,
  questionsForVertical,
} from "./catalogs";
export { inferPersonaFromIntent, resolvePersona } from "./inferPersona";
export { findQuestionsForIntent, rankQuestions } from "./rankQuestions";
export {
  compileRecipe,
  inferChartGeometry,
  questionToRecipe,
  questionsToRecipes,
  type ChartGeometry,
  type CompiledRecipeResult,
  type CompileRecipeOptions,
  type PanelRecipe,
} from "./recipes";
export { enrichAttendance, enrichLedger, enrichSales, enrichTabular } from "./enrich";
export {
  cellNumber,
  findNamedField,
  formatHours,
  formatRm,
  parseAmount,
  type TabularEnrichment,
} from "./enrich/types";
export { applyKpiToRecipe, applyRecipeData, formatKpiDisplay, resolveKpiValue } from "./applyRecipeData";
export {
  PANEL_BUDGET,
  planDashboardFromRows,
  type PlanDashboardFromRowsOptions,
  type TabularDashboardPlan,
  type TabularPlanBlock,
  type TabularPlanDecision,
} from "./planDashboardFromRows";
export { suggestAnalyticsFromProfile, type SuggestAnalyticsOptions } from "./suggestAnalyticsFromProfile";
export { composeLayout, type ComposeLayoutInput, type ComposeLayoutOptions, type LayoutPlan, type LayoutVariant } from "./composeLayout";
export { extractTabularFromMessage } from "./extractTabularFromMessage";
export {
  detectIncidentTable,
  suggestIncidentAnalytics,
} from "./composeIncidentDashboard";
