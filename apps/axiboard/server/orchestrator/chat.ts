import { inferPersonaFromIntent, type Persona } from "@axicharts/charts-spec/planning";
import type { ByokConfig, OrchestratorChatRequest, OrchestratorChatResult } from "../types";
import { parseChatWithLlm } from "./byok";
import { runTabularPlan } from "./plan";

function uniqueStrings(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const trimmed = value.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    result.push(trimmed);
  }
  return result;
}

export async function runOrchestratorChat(
  rows: Record<string, unknown>[],
  request: OrchestratorChatRequest,
  byok?: ByokConfig,
): Promise<OrchestratorChatResult> {
  const message = request.message?.trim() ?? "";
  let persona: Persona | undefined = request.persona;
  let followUpIntents = [...(request.followUpIntents ?? [])];
  let llmUsed = false;
  let llmNotes: string | undefined;

  if (message) {
    if (byok?.apiKey) {
      const parsed = await parseChatWithLlm(message, byok);
      persona = parsed.persona ?? persona;
      followUpIntents = uniqueStrings([...followUpIntents, ...parsed.followUpIntents, message]);
      llmUsed = true;
      llmNotes = parsed.notes;
    } else {
      followUpIntents = uniqueStrings([...followUpIntents, message]);
      persona = inferPersonaFromIntent(message) ?? persona;
    }
  }

  const plan = runTabularPlan(rows, {
    persona,
    followUpIntents,
    intent: request.intent,
  });

  if (!plan) {
    throw new Error("Unable to plan dashboard for this tabular data");
  }

  const assistantMessage = llmUsed
    ? `Planned ${plan.summary.chartCount} charts and ${plan.summary.kpiCount} KPIs for ${plan.persona} (${plan.vertical}).`
    : `Planned ${plan.summary.chartCount} charts and ${plan.summary.kpiCount} KPIs (rules-only).`;

  return {
    ...plan,
    followUpIntents,
    assistantMessage,
    llm: {
      used: llmUsed,
      provider: llmUsed ? "openai-compatible" : undefined,
      notes: llmNotes,
    },
  };
}
