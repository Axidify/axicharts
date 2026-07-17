import type { LlmPlannerProvider } from "../types";

export type OpenAiChatProviderOptions = {
  apiKey: string;
  model?: string;
  baseUrl?: string;
  id?: string;
};

type ChatCompletionResponse = {
  choices?: Array<{ message?: { content?: string | null } }>;
};

export function createOpenAiChatProvider(
  options: OpenAiChatProviderOptions,
): LlmPlannerProvider {
  const {
    apiKey,
    model = "gpt-4o-mini",
    baseUrl = "https://api.openai.com/v1",
    id = "openai",
  } = options;

  return {
    id,
    async complete(prompt) {
      const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          temperature: 0.2,
          messages: [
            {
              role: "system",
              content: "You are a dashboard planner. Return only valid JSON.",
            },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        const detail = await response.text();
        throw new Error(`OpenAI HTTP ${response.status}: ${detail.slice(0, 240)}`);
      }

      const payload = (await response.json()) as ChatCompletionResponse;
      const content = payload.choices?.[0]?.message?.content;
      if (!content?.trim()) {
        throw new Error("OpenAI response missing message content");
      }

      return content;
    },
  };
}

export function resolvePlannerProviderFromEnv(
  env: Record<string, string | undefined> = process.env,
): LlmPlannerProvider | undefined {
  const apiKey = env.OPENAI_API_KEY ?? env.AXICHARTS_PLANNER_API_KEY;
  if (!apiKey?.trim()) return undefined;

  return createOpenAiChatProvider({
    apiKey: apiKey.trim(),
    model: env.OPENAI_MODEL ?? env.AXICHARTS_PLANNER_MODEL ?? "gpt-4o-mini",
    baseUrl: env.OPENAI_BASE_URL ?? env.AXICHARTS_PLANNER_BASE_URL,
  });
}
