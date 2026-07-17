import type { LlmPlannerProvider } from "./types";
import { resolvePlannerProviderFromEnv } from "./providers/openai";

export type PlannerProviderMode = "auto" | "rules" | "openai";

export function resolvePlannerProvider(
  mode: PlannerProviderMode = "auto",
  env: Record<string, string | undefined> = process.env,
): LlmPlannerProvider | undefined {
  if (mode === "rules") return undefined;
  const provider = resolvePlannerProviderFromEnv(env);
  if (mode === "openai" && !provider) {
    throw new Error(
      "OpenAI provider requested but OPENAI_API_KEY (or AXICHARTS_PLANNER_API_KEY) is not set",
    );
  }
  return provider;
}
