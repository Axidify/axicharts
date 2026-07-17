export const PHASE3_PLANNER_CODE = `import { planFromIntent, DEFAULT_OPS_PROFILE } from "@axicharts/charts-planner";

const plan = planFromIntent(
  DEFAULT_OPS_PROFILE,
  "REST API polling /api/metrics endpoint",
);
// → { template: "ops-2x2", layout: "embed", feed: "rest", panels: [...] }`;
