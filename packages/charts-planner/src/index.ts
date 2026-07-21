export type {
  DashboardPlan,
  LlmPlannerProvider,
  MosaicPresetId,
  PlannerFeed,
  PlannerLayout,
  PlannerRequest,
  PlannerSource,
} from "./types";

export {
  isTemplateId,
  parsePlannerJson,
  validateAgentDashboardPlan,
  validateDashboardPlan,
  validatePanelSpec,
  validatePanelSpecs,
} from "./validate";
export { enrichProfileFromIntent } from "./intent";
export { inferTemplateFromIntent, inferMosaicPresetFromIntent, inferFeed } from "./plan";
export {
  buildPlannerPrompt,
  planDashboardShellFromIntent,
  planFromIntent,
  planFromProfile,
} from "./plan";
export {
  createFetchPlannerProvider,
  createMockPlannerProvider,
  planWithProvider,
} from "./provider";
export {
  createOpenAiChatProvider,
  resolvePlannerProviderFromEnv,
  type OpenAiChatProviderOptions,
} from "./providers/openai";
export {
  resolvePlannerProvider,
  type PlannerProviderMode,
} from "./resolveProvider";
export {
  fetchPlannerHealth,
  requestDashboardPlan,
  type PlannerHealth,
  type RequestDashboardPlanOptions,
} from "./client";
export { planFromCsv, profileFromCsv, type PlanFromCsvOptions } from "./planFromCsv";
export { planDashboardFromRows, type PlannerDashboardPlan, type PlannerDashboardOptions } from "./planDashboardFromRows";

export const DEFAULT_OPS_PROFILE = {
  metrics: [
    { name: "cpu", unit: "%", tags: { vertical: "ops", refresh: "live" } },
    { name: "memory", unit: "%", tags: { vertical: "ops", refresh: "live" } },
    { name: "errors", unit: "/min", tags: { vertical: "ops", refresh: "live" } },
    { name: "p95", unit: "ms", tags: { vertical: "ops", refresh: "live" } },
  ],
} as const;
