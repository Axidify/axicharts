export { SPEC_VERSION } from "./types";
export type {
  ChartConfigEntrySpec,
  ChartConfigSpec,
  ChartMode,
  ColorEncoding,
  DashboardSpec,
  DataProfile,
  FieldEncoding,
  FieldFormat,
  FieldProfile,
  FieldRole,
  FieldType,
  MetricKind,
  MetricProfile,
  ChartBlockBandMark,
  ChartBlockMarkSpec,
  ChartBlockRuleMark,
  ChartBlockSeriesMark,
  PanelChartType,
  PanelSpec,
  PanelStyleSpec,
  SizeEncoding,
  SpecData,
  BuiltinTemplateId,
  TemplateId,
  ThemeName,
} from "./types";

export { blockMarksToChartProps, type BlockMarksChartProps } from "./blockMarks";
export {
  normalizeBlockMark,
  normalizeMarksArray,
  isDataMark,
  isOverlayMark,
} from "./cartesianMarks";
export {
  validateCartesianSpec,
  assertValidCartesianSpec,
  detectPreNormalizeWarnings,
  CartesianSpecValidationError,
  type CartesianValidationError,
  type CartesianValidationIssue,
  type ValidateCartesianOptions,
} from "./cartesianValidation";
export { normalizeToCartesian, normalizeRawCartesianPanel, type NormalizedCartesianSpec } from "./normalizeToCartesian";
export { suggestField, levenshtein } from "./fieldSuggest";
export {
  BlocksPlayground,
  BLOCKS_PLAYGROUND_PRESETS,
  evaluatePlaygroundSpec,
  formatPlaygroundEject,
  parsePlaygroundData,
  findPlaygroundPreset,
  presetSpecJson,
  type BlocksPlaygroundProps,
  type BlocksPlaygroundPreset,
  type PlaygroundEvaluation,
} from "./blocksPlayground";
export {
  createCartesianPanel,
  reviseCartesianPanel,
  listCartesianMarks,
  CARTESIAN_MARK_CATALOG,
  type CreateCartesianPanelInput,
  type CreateCartesianPanelResult,
  type ReviseCartesianPanelInput,
  type ReviseCartesianPanelResult,
  type PlannerReviewReason,
  type CartesianMarkCatalogEntry,
} from "./createCartesianPanel";
export { compilePanel, type CompileOptions } from "./compilePanel";
export {
  compileDashboard,
  compileTemplate,
  listTemplates,
  type TemplateCompileOptions,
  capacityGridTemplate,
  financePnlTemplate,
  lineOverviewTemplate,
  ops2x2Template,
  pluginsWallTemplate,
  tradingBlotterTemplate,
  sreIncidentTemplate,
  saasGrowthTemplate,
} from "./templates";
export { DEFAULT_PLUGINS_WALL_PANELS } from "./pluginsWallData";
export { Chart, Dashboard, type ChartProps, type DashboardProps } from "./Chart";
export { ejectPanel, type EjectOptions } from "./eject";
export {
  planPanelFromMetric,
  planPanelsFromProfile,
  suggestTemplate,
  type PlanPanelsOptions,
} from "./plan";
export {
  findProfileColorField,
  inferColorEncodingForPanel,
  intentWantsColorEncoding,
} from "./colorEncodingPlan";
export {
  findProfileSizeField,
  inferSizeEncodingForPanel,
  intentWantsSizeEncoding,
} from "./sizeEncodingPlan";
export {
  inferLineCurveForPanel,
  intentWantsLinearCurve,
  intentWantsMonotoneCurve,
} from "./curveEncodingPlan";
export {
  applyVerticalRules,
  colorFieldPriorityForVertical,
  attendanceRulePack,
  financeRulePack,
  ledgerRulePack,
  opsRulePack,
  resolveVerticalId,
  salesRulePack,
  tradingRulePack,
  type VerticalId,
  type VerticalRulePack,
} from "./rulePacks";
export {
  applySpecCompilers,
  clearSpecCompilers,
  listSpecCompilers,
  registerSpecCompiler,
  type SpecCompiler,
  type SpecCompilerContext,
} from "./specCompiler";
export { normalizePanelSpec, parseDashboardSpecFile, parseDataProfileFile, parsePanelSpecFile } from "./parseSpec";
export { resolveTheme } from "./themes";
export {
  clearBuiltinTemplates,
  clearCommunityTemplates,
  getTemplateRenderer,
  isRegisteredTemplate,
  listTemplateMeta,
  registerBuiltinDashboardTemplate,
  registerDashboardTemplate,
  type DashboardTemplateMeta,
  type DashboardTemplateRegistration,
  type DashboardTemplateRenderer,
} from "./templateRegistry";
export { registerPluginChartTypes } from "./registerPluginChartTypes";
export {
  assertPanelCategoryEnabled,
  clearCategoryRegistration,
  isCategoryRegistered,
  listRegisteredCategories,
  PANEL_TYPE_CATEGORY,
  registerCategory,
  resolvePanelCategory,
  type PanelCategory,
} from "./panelCategories";
export {
  compileFinancePnlDeckSlide,
  compileLineOverviewDeckSlide,
  compileOps2x2DeckCell,
  type DeckSlideCompileOptions,
} from "./deckSlides";
export {
  chartPropsWithoutStyle,
  readPanelStyle,
  themeWithPanelStyle,
} from "./panelStyle";
export {
  chartPropsWithoutChromeMeta,
  readPanelChrome,
  type LegendVariant,
  type PanelChromeSpec,
  type TooltipVariant,
} from "./panelChrome";
export { asRows, pluckField, readArray, readNumber } from "./data";
export {
  aggregateRows,
  type AggregateOp,
  type AggregateRowsOptions,
  type AggregateSpec,
} from "./aggregateRows";
export { parseTabular, type TabularRow } from "./parseTabular";
export { createTablePanel, type CreateTablePanelInput } from "./createTablePanel";
export {
  classifyTabularDomain,
  enrichProfileWithDomain,
  MIN_DOMAIN_CONFIDENCE_TO_TAG,
  type ClassifyTabularDomainInput,
  type DomainSemantics,
  type TabularVerticalId,
} from "./classifyTabularDomain";
export {
  ALL_TABULAR_QUESTIONS,
  ATTENDANCE_QUESTIONS,
  findQuestionsForIntent,
  inferPersonaFromIntent,
  LEDGER_QUESTIONS,
  questionsForVertical,
  rankQuestions,
  resolvePersona,
  SALES_QUESTIONS,
  type AnalyticalQuestion,
  type Persona,
  type PlanningContext,
  type RankedQuestion,
  type RankQuestionsInput,
  type RankQuestionsResult,
  compileRecipe,
  inferChartGeometry,
  questionToRecipe,
  questionsToRecipes,
  type ChartGeometry,
  type CompiledRecipeResult,
  type CompileRecipeOptions,
  type PanelRecipe,
  enrichAttendance,
  enrichLedger,
  enrichSales,
  enrichTabular,
  planDashboardFromRows,
  type PlanDashboardFromRowsOptions,
  type TabularDashboardPlan,
  type TabularPlanBlock,
  type TabularPlanDecision,
  type TabularEnrichment,
} from "./planning";
export {
  inferFieldRoles,
  fieldProfilesToDataProfile,
  roleOfField,
  type InferFieldRolesOptions,
} from "./inferFieldRoles";
export { PanelSpecGrid, type PanelSpecGridProps } from "./PanelSpecGrid";
export {
  validateCartesianPanelSchemaRaw,
  validateDataProfileSchemaRaw,
  CARTESIAN_PANEL_SCHEMA_URL,
  DATA_PROFILE_SCHEMA_URL,
  HOSTED_CARTESIAN_PANEL_SCHEMA_URL,
  HOSTED_DATA_PROFILE_SCHEMA_URL,
  type SchemaValidationIssue,
  type SchemaValidationResult,
} from "./schemaValidation";
