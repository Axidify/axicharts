import { aggregateRows } from "../../aggregateRows";
import { createCartesianPanel } from "../../createCartesianPanel";
import { createTablePanel } from "../../createTablePanel";
import { validateCartesianSpec } from "../../cartesianValidation";
import { inferChartGeometry } from "./inferGeometry";
import type {
  ChartGeometry,
  CompileRecipeOptions,
  CompiledRecipeResult,
  PanelRecipe,
} from "./types";

function sortByStageOrder(
  rows: Record<string, unknown>[],
  groupField: string,
  order: readonly string[],
): void {
  rows.sort((a, b) => {
    const left = order.indexOf(String(a[groupField]));
    const right = order.indexOf(String(b[groupField]));
    return (left === -1 ? 99 : left) - (right === -1 ? 99 : right);
  });
}

function compileFunnelPanel(
  recipe: PanelRecipe,
  rows: Record<string, unknown>[],
): CompiledRecipeResult {
  const xField = recipe.xField ?? recipe.groupBy ?? "stage";
  const yField = recipe.yField ?? "value";
  const stages = rows.map((row) => ({
    name: String(row[xField]),
    value: Number(row[yField] ?? 0),
  }));

  return {
    panel: {
      specVersion: 1,
      type: "funnel",
      title: recipe.title,
      theme: "clean",
      mode: "interactive",
      props: { stages },
    },
    rows,
    geometry: { panelType: "funnel", rules: ["compile:funnel"] },
    matchedRules: ["recipe-funnel", "geometry:stage-funnel"],
  };
}

function compileStatPanel(
  recipe: PanelRecipe,
  options: CompileRecipeOptions,
): CompiledRecipeResult {
  const value = recipe.kpiValue ?? 0;
  const display =
    typeof value === "number" && !Number.isInteger(value)
      ? value.toLocaleString("en-MY", { maximumFractionDigits: 1 })
      : String(value);

  return {
    panel: {
      specVersion: 1,
      type: "stat",
      title: recipe.title,
      theme: options.theme ?? "clean",
      mode: options.mode ?? "interactive",
      props: {
        label: recipe.kpiLabel ?? recipe.title,
        value: display,
        monospace: true,
      },
    },
    rows: [{ value }],
    geometry: { panelType: "stat", rules: ["compile:stat"] },
    matchedRules: ["recipe-stat"],
  };
}

function compileTablePanel(recipe: PanelRecipe, rows: Record<string, unknown>[]): CompiledRecipeResult {
  const panel = createTablePanel({
    title: recipe.title,
    columns: recipe.tableColumns,
  });
  return {
    panel,
    rows,
    geometry: { panelType: "table", rules: ["compile:table"] },
    matchedRules: ["recipe-table"],
  };
}

function compileWaterfallPanel(recipe: PanelRecipe, rows: Record<string, unknown>[]): CompiledRecipeResult {
  const items =
    recipe.waterfallItems ??
    rows.map((row) => ({
      name: String(row.name ?? row.category ?? ""),
      value: Number(row.value ?? 0),
      ...(row.isTotal ? { isTotal: true } : {}),
    }));

  return {
    panel: {
      specVersion: 1,
      type: "waterfall",
      title: recipe.title,
      theme: "clean",
      mode: "interactive",
      props: {
        items,
        valueFormat: "currency",
        currency: "MYR",
      },
    },
    rows,
    geometry: { panelType: "waterfall", rules: ["compile:waterfall"] },
    matchedRules: ["recipe-waterfall"],
  };
}

function compileCartesianPanel(
  recipe: PanelRecipe,
  rows: Record<string, unknown>[],
  geometry: ChartGeometry,
  options: CompileRecipeOptions,
): CompiledRecipeResult {
  const fields = rows.length > 0 ? Object.keys(rows[0]) : [];
  const result = createCartesianPanel({
    intent: recipe.intent,
    dataProfile: options.dataProfile,
    fields,
    xField: recipe.xField,
    yField: recipe.yField,
    yFields: recipe.yFields,
    theme: options.theme ?? "clean",
    mode: options.mode ?? "interactive",
  });

  const validation = validateCartesianSpec(result.panel, {
    dataProfile: options.dataProfile,
    rows,
  });

  const matchedRules = [
    ...result.matchedRules,
    ...geometry.rules,
    `mark:${geometry.markType ?? "bar"}`,
  ];
  if (!validation.ok) matchedRules.push("validation:needs-review");

  return {
    panel: { ...result.panel, title: recipe.title },
    rows,
    geometry,
    matchedRules,
  };
}

/**
 * C158 — compile a panel recipe to PanelSpec + chart-ready rows.
 */
export function compileRecipe(
  recipe: PanelRecipe,
  sourceRows: Record<string, unknown>[],
  options: CompileRecipeOptions = {},
): CompiledRecipeResult {
  if (recipe.panelType === "stat") {
    return compileStatPanel(recipe, options);
  }

  if (recipe.panelType === "table") {
    const rows = recipe.preparedRows ?? sourceRows;
    return compileTablePanel(recipe, rows);
  }

  if (recipe.panelType === "waterfall") {
    const rows = recipe.preparedRows ?? sourceRows;
    return compileWaterfallPanel(recipe, rows);
  }

  let chartRows: Record<string, unknown>[] =
    recipe.preparedRows ??
    (recipe.groupBy && recipe.aggregates
      ? aggregateRows(sourceRows, {
          groupBy: recipe.groupBy,
          aggregates: recipe.aggregates,
          where: recipe.where,
        })
      : sourceRows);

  if (recipe.stageOrder && recipe.groupBy) {
    sortByStageOrder(chartRows, recipe.groupBy, recipe.stageOrder);
  }

  if (recipe.panelType === "funnel") {
    return compileFunnelPanel(recipe, chartRows);
  }

  const geometry = inferChartGeometry({
    kind: "chart",
    intent: recipe.intent,
    fieldProfiles: options.dataProfile?.fieldProfiles ?? [],
    xField: recipe.xField,
    yField: recipe.yField,
    yFields: recipe.yFields,
    dimensionKey: recipe.stageOrder ? "stage" : undefined,
  });

  return compileCartesianPanel(recipe, chartRows, geometry, options);
}
