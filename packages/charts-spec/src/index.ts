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
  PanelChartType,
  PanelSpec,
  PanelStyleSpec,
  SizeEncoding,
  SpecData,
  TemplateId,
  ThemeName,
} from "./types";

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
} from "./templates";
export { DEFAULT_PLUGINS_WALL_PANELS } from "./pluginsWallData";
export { Chart, Dashboard, type ChartProps, type DashboardProps } from "./Chart";
export { ejectPanel } from "./eject";
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
export { registerPluginChartTypes } from "./registerPluginChartTypes";
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
