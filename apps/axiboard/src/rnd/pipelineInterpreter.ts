import { findQuestionsForIntent, type PanelSpec } from "@axicharts/charts-spec";
import type { DataProfile } from "@axicharts/charts-spec";
import type { PipelineEnrichment } from "./pipelineEnrich";
import { compilePipelineQuestion } from "./pipelineRecipes";

export type PipelineChartAction = {
  kind: "chart";
  step: string;
  intent: string;
  rows: Record<string, string | number>[];
  xField: string;
  yField?: string;
  title: string;
  panel?: PanelSpec;
};

export type PipelineTableAction = {
  kind: "table";
  step: string;
  intent: string;
  panel: PanelSpec;
  rows: Record<string, string | number>[];
};

export type PipelineFollowUpAction = PipelineChartAction | PipelineTableAction;

/** C154 / C156 / C158 — sales catalog + recipe compiler for follow-ups. */
export function interpretPipelineFollowUp(
  intent: string,
  enriched: PipelineEnrichment,
  dataProfile?: DataProfile,
): PipelineFollowUpAction[] {
  const matched = findQuestionsForIntent(intent, "sales");
  const actions: PipelineFollowUpAction[] = [];

  for (const question of matched) {
    const action = compilePipelineQuestion(question.id, enriched, dataProfile);
    if (action && !actions.some((existing) => existing.step === action.step)) {
      actions.push(action);
    }
  }

  return actions;
}
