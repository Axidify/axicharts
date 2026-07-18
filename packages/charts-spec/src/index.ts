export { SPEC_VERSION } from "./types";
export type {
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
  SpecData,
  TemplateId,
  ThemeName,
} from "./types";

export { compilePanel, type CompileOptions } from "./compilePanel";
export {
  compileDashboard,
  compileTemplate,
  listTemplates,
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
  chartPropsWithoutStyle,
  readPanelStyle,
  themeWithPanelStyle,
} from "./panelStyle";
export { asRows, pluckField, readArray, readNumber } from "./data";
