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
export { createCartesianPanel } from "../createCartesianPanel";
export { createTablePanel } from "../createTablePanel";
export { validateCartesianSpec, type CartesianValidationIssue } from "../cartesianValidation";
export { planPanelFromMetric, planPanelsFromProfile, suggestTemplate } from "../plan";
export { isRegisteredTemplate } from "../templateRegistry";
export { SPEC_VERSION } from "../types";
export type { DataProfile, FieldProfile, PanelSpec, TabularGrain, TemplateId, TimeSpan } from "../types";
export {
  profileTabular,
  computeCardinalities,
  inferGrain,
  inferTimeSpan,
} from "../profileTabular";
export * from "../planning";
