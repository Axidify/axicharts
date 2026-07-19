import {
  compileRecipe,
  questionToRecipe,
  questionsForVertical,
  type DataProfile,
  type PanelRecipe,
} from "@axicharts/charts-spec";
import type { PipelineEnrichment } from "./pipelineEnrich";
import type { PipelineFollowUpAction } from "./pipelineInterpreter";

function applyPipelinePreparedRows(
  recipe: PanelRecipe,
  enriched: PipelineEnrichment,
): PanelRecipe {
  const { fields } = enriched;

  switch (recipe.questionId) {
    case "sales.chart.by_stage":
      return {
        ...recipe,
        preparedRows: enriched.valueByStage,
        xField: fields.stage,
        yField: "value",
      };
    case "sales.chart.open_by_stage":
      return {
        ...recipe,
        preparedRows: enriched.openPipelineByStage,
        xField: fields.stage,
        yField: "value",
      };
    case "sales.chart.by_salesperson":
      return {
        ...recipe,
        preparedRows: enriched.valueBySalesperson,
        xField: fields.salesperson,
        yField: "value",
      };
    case "sales.chart.weighted_forecast":
      return {
        ...recipe,
        preparedRows: enriched.weightedBySalesperson,
        xField: fields.salesperson,
        yField: "weightedValue",
        intent: "weighted forecast bar chart by salesperson with value labels",
      };
    case "sales.chart.by_source":
      return {
        ...recipe,
        preparedRows: enriched.valueBySource,
        xField: fields.source,
        yField: "value",
      };
    case "sales.table.opportunities":
      return {
        ...recipe,
        preparedRows: enriched.derivedRows,
        tableColumns: [
          { key: fields.customer, label: "Customer" },
          { key: fields.salesperson, label: "Salesperson" },
          { key: fields.stage, label: "Stage" },
          { key: fields.value, label: "Value", align: "right" },
          { key: fields.probability, label: "Probability", align: "right" },
          { key: fields.expectedClose, label: "Expected close" },
        ],
      };
    default:
      return recipe;
  }
}

function compiledToAction(
  recipe: PanelRecipe,
  compiled: ReturnType<typeof compileRecipe>,
): PipelineFollowUpAction | null {
  if (compiled.panel.type === "table") {
    return {
      kind: "table",
      step: `Table — ${recipe.title} (follow-up)`,
      intent: recipe.intent,
      panel: compiled.panel,
      rows: compiled.rows as Record<string, string | number>[],
    };
  }

  if (
    compiled.panel.type === "cartesian" ||
    compiled.panel.type === "funnel" ||
    compiled.panel.type === "waterfall"
  ) {
    return {
      kind: "chart",
      step: `Chart — ${recipe.title} (follow-up)`,
      intent: recipe.intent,
      rows: compiled.rows as Record<string, string | number>[],
      xField: recipe.xField ?? recipe.groupBy ?? "x",
      yField: recipe.yField ?? "value",
      title: recipe.title,
      panel: compiled.panel,
    };
  }

  return null;
}

/** C158 — compile catalog question via panel recipe. */
export function compilePipelineQuestion(
  questionId: string,
  enriched: PipelineEnrichment,
  dataProfile?: DataProfile,
): PipelineFollowUpAction | null {
  const question = questionsForVertical("sales").find((entry) => entry.id === questionId);
  if (!question) return null;

  const baseRecipe = questionToRecipe(question, enriched.fieldProfiles);
  if (!baseRecipe) return null;

  const recipe = applyPipelinePreparedRows(baseRecipe, enriched);
  const compiled = compileRecipe(recipe, enriched.derivedRows, { dataProfile });
  return compiledToAction(recipe, compiled);
}
