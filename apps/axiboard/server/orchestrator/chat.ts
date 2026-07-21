import {
  applyTransformPlans,
  inferPersonaFromIntent,
  type Persona,
  type TabularVerticalId,
  type TransformPlan,
} from "@axicharts/charts-spec/planning";
import type { ByokConfig, OrchestratorChatRequest, OrchestratorChatResult } from "../types";
import { parseChatWithLlm } from "./byok";
import { runTabularPlan } from "./plan";
import { refinementAssistantMessage } from "./refinementMessage";

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
  let llmTransformPlans: TransformPlan[] = [];

  if (message) {
    if (byok?.apiKey) {
      const parsed = await parseChatWithLlm(message, byok);
      persona = parsed.persona ?? persona;
      llmTransformPlans = parsed.transformPlans;
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
    refinementIntent: isRefinementIntent(message) ? message : undefined,
  });

  if (!plan) {
    throw new Error("Unable to plan dashboard for this tabular data");
  }

  if (llmTransformPlans.length > 0) {
    const applied = applyTransformPlans(rows, llmTransformPlans, {
      dataProfile: plan.dataProfile,
      persona: plan.persona,
      vertical: plan.vertical as TabularVerticalId,
    });
    for (const item of applied) {
      if (!item.ok) continue;
      const questionId =
        item.plan.questionId ?? `llm.${item.plan.intent.toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 48)}`;
      const block = {
        questionId,
        panel: item.panel,
        rows: item.rows as Array<Record<string, string | number | boolean>>,
        decision: {
          step: "LLM transform plan",
          api: "applyTransformPlans",
          intent: item.plan.intent,
          status: "validated" as const,
          notes: "C178 structured compose",
        },
        validationIssues: [],
      };
      if (item.panel.type === "stat" || item.panel.type === "kpi") {
        plan.kpis.push(block);
      } else {
        plan.charts.push(block);
      }
      plan.decisions.push(block.decision);
    }
    plan.summary = {
      kpiCount: plan.kpis.length,
      chartCount: plan.charts.length,
      needsReview:
        plan.summary.needsReview ||
        applied.some((item) => !item.ok),
    };
  }

  const agentComposed = plan.decisions.some((decision) =>
    decision.api === "composeIncidentDashboard" ||
    decision.api === "composeProjectTaskDashboard" ||
    decision.api === "composeSupportCaseDashboard" ||
    decision.api === "composeDeviceTelemetryDashboard",
  );
  const followUpQuestionIds = plan.followUpQuestionIds ?? [];
  const refinementMessage =
    isRefinementIntent(message) && followUpQuestionIds.length > 0
      ? refinementAssistantMessage(plan, followUpQuestionIds)
      : null;

  let assistantMessage: string;
  if (refinementMessage) {
    assistantMessage = refinementMessage;
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
    followUpQuestionIds: isRefinementIntent(message) ? followUpQuestionIds : [],
    assistantMessage,
    llm: {
      used: llmUsed,
      provider: llmUsed ? "openai-compatible" : undefined,
      notes: llmNotes,
    },
  };
}
