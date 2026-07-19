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

/** Skip generic build phrases — they are not refinement intents. */
function isRefinementIntent(message: string): boolean {
  const lower = message.trim().toLowerCase();
  if (!lower) return false;
  if (/^(build|create|make)\b.*\bdashboard\b/.test(lower)) return false;
  if (/^dashboard for this/.test(lower)) return false;
  return true;
}

function followUpPanelsFromPlan(plan: Awaited<ReturnType<typeof runTabularPlan>>): string[] {
  if (!plan) return [];
  return plan.charts
    .filter(
      (block) =>
        block.questionId.startsWith("generic.table.below_reorder") ||
        block.questionId.startsWith("generic.followup."),
    )
    .map((block) => block.panel.title ?? block.questionId)
    .filter((title): title is string => Boolean(title));
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
      followUpIntents = uniqueStrings([
        ...followUpIntents,
        ...parsed.followUpIntents,
        ...(isRefinementIntent(message) ? [message] : []),
      ]);
      llmUsed = true;
      llmNotes = parsed.notes;
    } else {
      if (isRefinementIntent(message)) {
        followUpIntents = uniqueStrings([...followUpIntents, message]);
      }
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

  const agentComposed = plan.decisions.some((decision) =>
    decision.api === "composeIncidentDashboard" ||
    decision.api === "composeProjectTaskDashboard" ||
    decision.api === "composeSupportCaseDashboard" ||
    decision.api === "composeDeviceTelemetryDashboard",
  );
  const addedPanels = isRefinementIntent(message) ? followUpPanelsFromPlan(plan) : [];
  let assistantMessage: string;
  if (addedPanels.length > 0) {
    assistantMessage = `Updated dashboard — added ${addedPanels.join(", ")}.`;
  } else if (plan.decisions.some((decision) => decision.api === "composeProjectTaskDashboard")) {
    assistantMessage = `Built a project task dashboard — ${plan.summary.kpiCount} KPIs and ${plan.summary.chartCount} views including status, priority, owners, and the task register.`;
  } else if (plan.decisions.some((decision) => decision.api === "composeSupportCaseDashboard")) {
    assistantMessage = `Built a customer support dashboard — ${plan.summary.kpiCount} KPIs and ${plan.summary.chartCount} views including status, severity, issue types, and the case register.`;
  } else if (plan.decisions.some((decision) => decision.api === "composeDeviceTelemetryDashboard")) {
    assistantMessage = `Built an IoT sensor dashboard — ${plan.summary.kpiCount} KPIs and ${plan.summary.chartCount} views including temperature, battery, status, and the device readings table.`;
  } else if (agentComposed) {
    assistantMessage = `Built an incident dashboard — ${plan.summary.kpiCount} KPIs and ${plan.summary.chartCount} views including status, resolution time, and the ticket register.`;
  } else if (llmUsed) {
    assistantMessage = `Planned ${plan.summary.chartCount} charts and ${plan.summary.kpiCount} KPIs for ${plan.persona} (${plan.vertical}).`;
  } else {
    assistantMessage = `Planned ${plan.summary.chartCount} charts and ${plan.summary.kpiCount} KPIs (rules-only).`;
  }

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
