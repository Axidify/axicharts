import type { DataProfile } from "@axicharts/charts-spec";
import { planFromIntent, planFromProfile, buildPlannerPrompt } from "./plan";
import type { DashboardPlan, LlmPlannerProvider } from "./types";
import { parsePlannerJson, validateDashboardPlan } from "./validate";

export async function planWithProvider(
  profile: DataProfile,
  intent: string,
  provider: LlmPlannerProvider,
): Promise<DashboardPlan> {
  const fallback = planFromIntent(profile, intent);

  try {
    const raw = await provider.complete(buildPlannerPrompt(profile, intent));
    const parsed = parsePlannerJson(raw);
    const validated = validateDashboardPlan(parsed);
    if (validated) {
      return {
        ...validated,
        source: "llm",
        warnings: [
          ...(validated.warnings ?? []),
          `Validated output from provider "${provider.id}"`,
        ],
      };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      ...fallback,
      warnings: [`LLM planner failed (${provider.id}): ${message}. Used rules fallback.`],
    };
  }

  return {
    ...fallback,
    warnings: [`Invalid planner output from "${provider.id}". Used rules fallback.`],
  };
}

export function createMockPlannerProvider(response: string): LlmPlannerProvider {
  return {
    id: "mock",
    complete: async () => response,
  };
}

export function createFetchPlannerProvider(options: {
  id?: string;
  url: string;
  headers?: Record<string, string>;
  body?: (prompt: string) => unknown;
  extractText?: (payload: unknown) => string;
}): LlmPlannerProvider {
  const {
    id = "fetch",
    url,
    headers = { "content-type": "application/json" },
    body = (prompt) => ({ prompt }),
    extractText = (payload) => {
      if (
        typeof payload === "object" &&
        payload !== null &&
        "text" in payload &&
        typeof (payload as { text: unknown }).text === "string"
      ) {
        return (payload as { text: string }).text;
      }
      return JSON.stringify(payload);
    },
  } = options;

  return {
    id,
    async complete(prompt) {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body(prompt)),
      });
      if (!response.ok) {
        throw new Error(`Planner provider HTTP ${response.status}`);
      }
      const payload = (await response.json()) as unknown;
      return extractText(payload);
    },
  };
}

export { planFromProfile, planFromIntent, buildPlannerPrompt };
