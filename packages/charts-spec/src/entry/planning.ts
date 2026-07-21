/**
 * Server-safe charts-spec surface — tabular planning without React Chart / uPlot CSS.
 * Used by Axiboard orchestrator and charts-planner tabular path.
 */
export { parseTabular, type TabularRow } from "../parseTabular";
export {
  classifyTabularDomain,
  enrichProfileWithDomain,
  type DomainSemantics,
} from "../classifyTabularDomain";
export { aggregateRows, type AggregateRowsOptions, type AggregateSpec } from "../aggregateRows";
export { composePanel } from "../composePanel";
export {
  executeTransform,
  listTransformOps,
  type TransformOpCatalog,
} from "../executeTransform";
export {
  createCartesianPanel,
  listCartesianMarks,
  reviseCartesianPanel,
  type ReviseCartesianPanelInput,
  type ReviseCartesianPanelResult,
} from "../createCartesianPanel";
export { createTablePanel } from "../createTablePanel";
export { normalizeToCartesian, normalizeRawCartesianPanel, type NormalizedCartesianSpec } from "../normalizeToCartesian";
export { blockMarksToChartProps, type BlockMarksChartProps } from "../blockMarks";
export { validateCartesianSpec, type CartesianValidationIssue } from "../cartesianValidation";
export {
  resolvePanelFamily,
  isAgentChartFamily,
  type AgentChartFamily,
  type PanelFamily,
} from "../resolvePanelFamily";
export {
  validatePanel,
  assertValidPanel,
  PanelValidationError,
  type ValidationIssue,
  type ValidatePanelOptions,
  type ValidatePanelResult,
} from "../validatePanel";
export {
  registerChartFamily,
  getChartFamily,
  listChartFamilies,
  type ChartFamilyRegistration,
} from "../familyRegistry";
export {
  createPanel,
  UnsupportedPanelFamilyError,
  type CreatePanelInput,
  type CreatePanelResult,
} from "../createPanel";
export { listMarks, type MarkCatalogResult } from "../listMarks";
export {
  createDistributionPanel,
  listDistributionMarks,
  type CreateDistributionPanelInput,
  type CreateDistributionPanelResult,
} from "../createDistributionPanel";
export { validateDistributionSpec } from "../distributionValidation";
export { normalizeToDistribution } from "../normalizeToDistribution";
export { DISTRIBUTION_PANEL_SCHEMA_URL } from "../schemaUrls";
export { inferFieldRoles, fieldProfilesToDataProfile } from "../inferFieldRoles";
export { CARTESIAN_PANEL_SCHEMA_URL, DATA_PROFILE_SCHEMA_URL } from "../schemaUrls";
export { suggestTemplate } from "../plan";
export {
  AGENT_RUNTIME_PANEL_TYPES,
  LEGACY_PROFILE_PLANNER_PANEL_TYPES,
  agentRuntimePanelIssues,
  isAgentRuntimePanel,
  isAgentRuntimePanelType,
} from "../agentRuntimePanel";
export { isRegisteredTemplate } from "../templateRegistry";
export { SPEC_VERSION } from "../types";
export type {
  ChartMode,
  DataProfile,
  FieldProfile,
  PanelSpec,
  SpecData,
  TabularGrain,
  TemplateId,
  ThemeName,
  TimeSpan,
} from "../types";
export {
  profileTabular,
  computeCardinalities,
  inferGrain,
  inferTimeSpan,
} from "../profileTabular";
export * from "../tabularPlanning";
