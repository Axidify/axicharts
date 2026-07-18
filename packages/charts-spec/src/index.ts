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
  findPlaygroundPreset,
  presetSpecJson,
  type BlocksPlaygroundProps,
  type BlocksPlaygroundPreset,
  type PlaygroundEvaluation,
} from "./blocksPlayground";
export {
  createCartesianPanel,
  listCartesianMarks,
  CARTESIAN_MARK_CATALOG,
  type CreateCartesianPanelInput,
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
  financeRulePack,
  opsRulePack,
  resolveVerticalId,
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
