export type {
  DashboardPlan,
  LlmPlannerProvider,
  PlannerFeed,
  PlannerLayout,
  PlannerRequest,
  PlannerSource,
} from "./types";

export {
  isTemplateId,
  parsePlannerJson,
  validateDashboardPlan,
  validatePanelSpec,
  validatePanelSpecs,
} from "./validate";
export { enrichProfileFromIntent } from "./intent";
export { inferTemplateFromIntent } from "./plan";
export {
  buildPlannerPrompt,
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

export const DEFAULT_OPS_PROFILE = {
  metrics: [
    { name: "cpu", unit: "%", tags: { vertical: "ops", refresh: "live" } },
    { name: "memory", unit: "%", tags: { vertical: "ops", refresh: "live" } },
    { name: "errors", unit: "/min", tags: { vertical: "ops", refresh: "live" } },
    { name: "p95", unit: "ms", tags: { vertical: "ops", refresh: "live" } },
  ],
} as const;
