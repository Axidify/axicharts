import type { Persona } from "@axicharts/charts-spec";
import type { ByokConfig } from "../types";

export type ParsedChatIntent = {
  persona?: Persona;
  followUpIntents: string[];
  notes?: string;
};

const PERSONA_VALUES = new Set<Persona>(["executive", "manager", "analyst", "operator"]);

function isPersona(value: unknown): value is Persona {
  return typeof value === "string" && PERSONA_VALUES.has(value as Persona);
}

export async function parseChatWithLlm(
  message: string,
  config: ByokConfig,
): Promise<ParsedChatIntent> {
  const model = config.model ?? "gpt-4o-mini";
  const baseUrl = (config.baseUrl ?? "https://api.openai.com/v1").replace(/\/$/, "");

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      messages: [
        {
          role: "system",
          content: [
            "You parse dashboard chat for a tabular analytics product.",
            "Return JSON only: { persona?: executive|manager|analyst|operator, followUpIntents: string[] }.",
            "followUpIntents should be short NL phrases the planner can match to chart catalog questions.",
            "Do not invent chart specs or SQL.",
          ].join(" "),
        },
        { role: "user", content: message },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`LLM HTTP ${response.status}: ${detail.slice(0, 240)}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string | null } }>;
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content?.trim()) {
    throw new Error("LLM response missing message content");
  }

  const parsed = JSON.parse(content) as {
    persona?: unknown;
    followUpIntents?: unknown;
    notes?: unknown;
  };

  const followUpIntents = Array.isArray(parsed.followUpIntents)
    ? parsed.followUpIntents.filter((entry): entry is string => typeof entry === "string")
    : [];

  return {
    persona: isPersona(parsed.persona) ? parsed.persona : undefined,
    followUpIntents,
    notes: typeof parsed.notes === "string" ? parsed.notes : undefined,
  };
}
