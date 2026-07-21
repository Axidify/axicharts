import { aggregateRows } from "../aggregateRows";
import type { DataProfile, FieldProfile } from "../types";
import type { PanelRecipe } from "./recipes/types";
import type { Persona } from "./types";
import { cellNumber } from "./enrich/types";
import { PANEL_BUDGET } from "./planDashboardFromRows";

export type SuggestAnalyticsOptions = {
  persona?: Persona;
  dataProfile?: DataProfile;
};

const HIGH_CARDINALITY = 24;
const LOW_CARDINALITY_MIN = 2;

function cardinalityOf(
  field: string,
  rows: Record<string, unknown>[],
  cardinalities?: Record<string, number>,
): number {
  if (cardinalities?.[field] != null) return cardinalities[field]!;
  return new Set(rows.map((row) => String(row[field] ?? ""))).size;
}

function sumField(rows: Record<string, unknown>[], field: string): number {
  return rows.reduce((total, row) => total + cellNumber(row, field), 0);
}

function avgField(rows: Record<string, unknown>[], field: string): number {
  if (rows.length === 0) return 0;
  return sumField(rows, field) / rows.length;
}

function pickDimensions(fieldProfiles: FieldProfile[]): FieldProfile[] {
  return fieldProfiles.filter((profile) => profile.role === "dimension");
}

function pickMeasures(fieldProfiles: FieldProfile[]): FieldProfile[] {
  return fieldProfiles.filter((profile) => profile.role === "measure");
}

function pickTimeFields(fieldProfiles: FieldProfile[]): FieldProfile[] {
  return fieldProfiles.filter((profile) => profile.role === "time");
}

function dedupeRecipes(recipes: PanelRecipe[]): PanelRecipe[] {
  const seen = new Set<string>();
  const result: PanelRecipe[] = [];
  for (const recipe of recipes) {
    if (seen.has(recipe.questionId)) continue;
    seen.add(recipe.questionId);
    result.push(recipe);
  }
  return result;
}

/**
 * C173 — L4b generic analytics: synthesize panel recipes from field shapes.
 */
export function suggestAnalyticsFromProfile(
  rows: Record<string, unknown>[],
  options: SuggestAnalyticsOptions = {},
): PanelRecipe[] {
  if (rows.length === 0) return [];

  const fieldProfiles = options.dataProfile?.fieldProfiles ?? [];
  const cardinalities = options.dataProfile?.cardinalities;
  const measures = pickMeasures(fieldProfiles);
  const dimensions = pickDimensions(fieldProfiles);
  const timeFields = pickTimeFields(fieldProfiles);

  const recipes: PanelRecipe[] = [];

  recipes.push({
    questionId: "generic.kpi.rows",
    title: "Rows",
    intent: "kpi headline stat panel",
    panelType: "stat",
    vertical: "ops",
    kpiValue: rows.length,
    kpiLabel: "Rows",
  });

  for (const measure of measures.slice(0, 3)) {
    recipes.push({
      questionId: `generic.kpi.sum.${measure.name}`,
      title: `Total ${measure.name}`,
      intent: "kpi headline stat panel",
      panelType: "stat",
      vertical: "ops",
      kpiValue: sumField(rows, measure.name),
      kpiLabel: `Total ${measure.name}`,
    });
    recipes.push({
      questionId: `generic.kpi.avg.${measure.name}`,
      title: `Avg ${measure.name}`,
      intent: "kpi headline stat panel",
      panelType: "stat",
      vertical: "ops",
      kpiValue: avgField(rows, measure.name),
      kpiLabel: `Avg ${measure.name}`,
    });
  }

  for (const dim of dimensions) {
    const card = cardinalityOf(dim.name, rows, cardinalities);
    if (card < LOW_CARDINALITY_MIN || card > HIGH_CARDINALITY) continue;
    if (/(\bid\b|_id$| id$)/i.test(dim.name) && card >= rows.length) continue;

    recipes.push({
      questionId: `generic.chart.count.${dim.name}`,
      title: `Count by ${dim.name}`,
      intent: "count bar chart with value labels",
      panelType: "cartesian",
      markType: "bar",
      vertical: "ops",
      groupBy: dim.name,
      xField: dim.name,
      yField: "count",
      aggregates: { count: { op: "count" } },
    });
  }

  const primaryMeasure = measures[0];
  if (primaryMeasure) {
    for (const dim of dimensions) {
      const card = cardinalityOf(dim.name, rows, cardinalities);
      if (card < LOW_CARDINALITY_MIN || card > HIGH_CARDINALITY) continue;
      if (/(\bid\b|_id$| id$)/i.test(dim.name) && card >= rows.length) continue;
      recipes.push({
        questionId: `generic.chart.sum.${dim.name}`,
        title: `${primaryMeasure.name} by ${dim.name}`,
        intent: "bar chart with value labels",
        panelType: "cartesian",
        markType: "bar",
        vertical: "ops",
        groupBy: dim.name,
        xField: dim.name,
        yField: "value",
        aggregates: { value: { op: "sum", field: primaryMeasure.name } },
      });
    }
  }

  if (timeFields[0] && primaryMeasure) {
    const timeField = timeFields[0].name;
    const trendRows = aggregateRows(rows, {
      groupBy: timeField,
      aggregates: { value: { op: "sum", field: primaryMeasure.name } },
    }).sort((left, right) => String(left[timeField]).localeCompare(String(right[timeField])));

    recipes.push({
      questionId: `generic.chart.trend.${timeField}`,
      title: `${primaryMeasure.name} over time`,
      intent: "line chart over time smooth monotone",
      panelType: "cartesian",
      markType: "line",
      vertical: "ops",
      preparedRows: trendRows,
      groupBy: timeField,
      xField: timeField,
      yField: "value",
      aggregates: { value: { op: "sum", field: primaryMeasure.name } },
    });
  }

  recipes.push({
    questionId: "generic.table.rows",
    title: "Data table",
    intent: "row level data table",
    panelType: "table",
    vertical: "ops",
    tableColumns: fieldProfiles.map((profile) => ({
      key: profile.name,
      label: profile.name,
      align: profile.role === "measure" ? "right" : "left",
    })),
  });

  const statRecipes = dedupeRecipes(recipes.filter((recipe) => recipe.panelType === "stat"));
  const chartRecipes = dedupeRecipes(recipes.filter((recipe) => recipe.panelType !== "stat"));

  const kpis = statRecipes.slice(0, PANEL_BUDGET.maxKpis);
  const charts = chartRecipes.slice(0, PANEL_BUDGET.maxCharts);

  return [...kpis, ...charts];
}
