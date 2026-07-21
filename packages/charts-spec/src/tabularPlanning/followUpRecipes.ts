import type { FieldProfile } from "../types";
import type { PanelRecipe } from "./recipes/types";
import { cellNumber } from "./enrich/types";
import { inferOrdinalOrder } from "./inferOrdinalOrder";
import { incidentRecipesFromFollowUp } from "./incidentFollowUpRecipes";

function pickDimensions(fieldProfiles: FieldProfile[]): FieldProfile[] {
  return fieldProfiles.filter((profile) => profile.role === "dimension");
}

function pickMeasures(fieldProfiles: FieldProfile[]): FieldProfile[] {
  return fieldProfiles.filter((profile) => profile.role === "measure");
}

function findField(fieldProfiles: FieldProfile[], pattern: RegExp): string | undefined {
  return fieldProfiles.find((profile) => pattern.test(profile.name))?.name;
}

function tableRecipe(
  questionId: string,
  title: string,
  rows: Record<string, unknown>[],
  fieldProfiles: FieldProfile[],
): PanelRecipe {
  return {
    questionId,
    title,
    intent: "filtered data table",
    panelType: "table",
    vertical: "ops",
    preparedRows: rows,
    tableColumns: fieldProfiles.map((profile) => ({
      key: profile.name,
      label: profile.name,
      align: profile.role === "measure" ? "right" : "left",
    })),
  };
}

function countBarRecipe(
  questionId: string,
  title: string,
  dim: FieldProfile,
  rows: Record<string, unknown>[],
): PanelRecipe {
  const stageOrder = inferOrdinalOrder(
    dim.name,
    rows.map((row) => row[dim.name]),
  );
  return {
    questionId,
    title,
    intent: "count bar chart with value labels",
    panelType: "cartesian",
    markType: "bar",
    vertical: "ops",
    groupBy: dim.name,
    xField: dim.name,
    yField: "count",
    aggregates: { count: { op: "count" } },
    ...(stageOrder ? { stageOrder } : {}),
  };
}

/**
 * C181 v1 — map refinement intents to filtered tables and breakdown charts.
 */
export function recipesFromFollowUp(
  intent: string,
  rows: Record<string, unknown>[],
  fieldProfiles: FieldProfile[],
): PanelRecipe[] {
  const recipes: PanelRecipe[] = [];
  const measures = pickMeasures(fieldProfiles);
  const dimensions = pickDimensions(fieldProfiles);
  const lower = intent.toLowerCase();

  const reorderField = findField(fieldProfiles, /reorder/i);
  const stockField = findField(fieldProfiles, /stock|qty|quantity/i);
  const statusField = findField(fieldProfiles, /status/i);
  const priorityField = findField(fieldProfiles, /priority|severity/i);

  if (reorderField && stockField && /below|under|low|reorder/i.test(lower)) {
    const filtered = rows.filter(
      (row) => cellNumber(row, stockField) < cellNumber(row, reorderField),
    );
    recipes.push(tableRecipe("generic.table.below_reorder", "Below reorder level", filtered, fieldProfiles));
  }

  if (statusField && /\bopen\b|in progress|active|unresolved/i.test(lower) && !/closed|resolved/i.test(lower)) {
    const filtered = rows.filter((row) => !/closed|resolved|done/i.test(String(row[statusField] ?? "")));
    recipes.push(tableRecipe("generic.table.open_status", "Open items", filtered, fieldProfiles));
  }

  if (priorityField && /critical|high priority|escalat/i.test(lower)) {
    const filtered = rows.filter((row) =>
      /critical|high/i.test(String(row[priorityField] ?? "")),
    );
    recipes.push(
      tableRecipe("generic.table.high_priority", "Critical / High priority", filtered, fieldProfiles),
    );
  }

  const topMatch = lower.match(/top\s+(\d+)/i);
  if (topMatch && measures[0]) {
    const limit = Math.max(1, Number.parseInt(topMatch[1]!, 10));
    const measure = measures[0].name;
    const sorted = [...rows].sort(
      (left, right) => cellNumber(right, measure) - cellNumber(left, measure),
    );
    recipes.push(
      tableRecipe(
        `generic.table.top_${limit}_${measure}`,
        `Top ${limit} by ${measure}`,
        sorted.slice(0, limit),
        fieldProfiles,
      ),
    );
  }

  for (const dim of dimensions) {
    const dimLower = dim.name.toLowerCase();
    const mentionsDim =
      lower.includes(dimLower) ||
      (/breakdown|by\s/.test(lower) && new RegExp(`\\b${dimLower}\\b`).test(lower));
    if (!mentionsDim) continue;

    recipes.push(
      countBarRecipe(`generic.followup.count.${dim.name}`, `Count by ${dim.name}`, dim, rows),
    );

    if (measures[0]) {
      recipes.push({
        questionId: `generic.followup.sum.${dim.name}`,
        title: `${measures[0].name} by ${dim.name}`,
        intent: "bar chart with value labels",
        panelType: "cartesian",
        markType: "bar",
        vertical: "ops",
        groupBy: dim.name,
        xField: dim.name,
        yField: "value",
        aggregates: { value: { op: "sum", field: measures[0].name } },
        stageOrder: inferOrdinalOrder(dim.name, rows.map((row) => row[dim.name])),
      });
    }
  }

  return recipes;
}

export type CollectFollowUpOptions = {
  /** Include incident-specific follow-up recipes (open tickets, priority filter). */
  incident?: boolean;
};

export function collectFollowUpRecipes(
  intents: string[],
  rows: Record<string, unknown>[],
  fieldProfiles: FieldProfile[],
  options: CollectFollowUpOptions = {},
): { recipes: PanelRecipe[]; questionIds: string[] } {
  const seen = new Set<string>();
  const recipes: PanelRecipe[] = [];
  const questionIds: string[] = [];

  for (const intent of intents) {
    const batch = options.incident
      ? [...incidentRecipesFromFollowUp(intent, rows, fieldProfiles), ...recipesFromFollowUp(intent, rows, fieldProfiles)]
      : recipesFromFollowUp(intent, rows, fieldProfiles);

    for (const recipe of batch) {
      if (seen.has(recipe.questionId)) continue;
      seen.add(recipe.questionId);
      recipes.push(recipe);
      questionIds.push(recipe.questionId);
    }
  }

  return { recipes, questionIds };
}
