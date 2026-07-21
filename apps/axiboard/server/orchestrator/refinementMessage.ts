import type { OrchestratorPlanResult } from "../types";

export function titlesForFollowUpPanels(
  plan: OrchestratorPlanResult,
  questionIds: string[],
): string[] {
  const idSet = new Set(questionIds);
  return [...plan.kpis, ...plan.charts]
    .filter((block) => block.questionId && idSet.has(block.questionId))
    .map((block) => block.panel.title ?? block.questionId!)
    .filter(Boolean);
}

export function refinementAssistantMessage(
  plan: OrchestratorPlanResult,
  followUpQuestionIds: string[],
): string | null {
  if (followUpQuestionIds.length === 0) return null;
  const titles = titlesForFollowUpPanels(plan, followUpQuestionIds);
  if (titles.length === 0) return null;
  return `Updated dashboard — added ${titles.join(", ")}.`;
}
