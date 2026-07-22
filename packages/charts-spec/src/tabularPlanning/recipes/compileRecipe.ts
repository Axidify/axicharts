import { aggregateRows } from "../../aggregateRows";
import { createCartesianPanel } from "../../createCartesianPanel";
import { createTablePanel } from "../../createTablePanel";
import { validateCartesianSpec } from "../../cartesianValidation";
import { isNominalColorDimension } from "../../nominalColorMap";
import { horizontalBarPanelHeight } from "../../panelOrientation";
import { inferChartGeometry } from "./inferGeometry";
import type {
  ChartGeometry,
  CompileRecipeOptions,
  CompiledRecipeResult,
  PanelRecipe,
} from "./types";
import type { PanelSpec } from "../../types";

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

function compileDistributionArcPanel(
  recipe: PanelRecipe,
  rows: Record<string, unknown>[],
): CompiledRecipeResult {
  const xField = recipe.xField ?? recipe.groupBy ?? "category";
  const yField = recipe.yField ?? "value";
  const marks: PanelSpec["marks"] = [{ type: "arc", field: yField }];
  const matchedRules = ["recipe-pie", "mark:arc"];

  if (recipe.panelType === "donut") {
    marks.push({ type: "donut", innerRadius: 42 });
    matchedRules.push("mark:donut");
  }

  marks.push({ type: "label", show: true });
  matchedRules.push("mark:label");

  return {
    panel: {
      specVersion: 1,
      type: "distribution",
      title: recipe.title,
      theme: "clean",
      mode: "interactive",
      encoding: {
        angle: { field: yField, type: "quantitative" },
        color: { field: xField, type: "nominal" },
      },
      marks,
    },
    rows,
    geometry: {
      panelType: recipe.panelType === "donut" ? "donut" : "pie",
      rules: [`compile:distribution-${recipe.panelType}`],
    },
    matchedRules,
  };
}

function compileDistributionFunnelPanel(
  recipe: PanelRecipe,
  rows: Record<string, unknown>[],
): CompiledRecipeResult {
  const xField = recipe.xField ?? recipe.groupBy ?? "stage";
  const yField = recipe.yField ?? "value";

  return {
    panel: {
      specVersion: 1,
      type: "distribution",
      title: recipe.title,
      theme: "clean",
      mode: "interactive",
      encoding: {
        angle: { field: yField, type: "quantitative" },
        color: { field: xField, type: "nominal" },
      },
      marks: [
        { type: "funnel", field: yField },
        { type: "label", show: true },
      ],
    },
    rows,
    geometry: { panelType: "funnel", rules: ["compile:distribution-funnel"] },
    matchedRules: ["recipe-funnel", "geometry:stage-funnel", "mark:funnel"],
  };
}

function compileMatrixPanel(
  recipe: PanelRecipe,
  rows: Record<string, unknown>[],
): CompiledRecipeResult {
  const fields = rows.length > 0 ? Object.keys(rows[0]!) : [];
  const xField = recipe.xField ?? recipe.groupBy ?? fields[0] ?? "x";
  const valueField = recipe.yField ?? "value";
  const yField =
    fields.find((field) => field !== xField && field !== valueField) ?? "y";

  return {
    panel: {
      specVersion: 1,
      type: "matrix",
      title: recipe.title,
      theme: "clean",
      mode: "interactive",
      encoding: {
        x: { field: xField, type: "nominal" },
        y: { field: yField, type: "nominal" },
        value: { field: valueField, type: "quantitative" },
      },
      marks: [
        { type: "cell", field: valueField },
        { type: "colorScale", field: valueField },
        { type: "axis", dimension: "x", show: true },
        { type: "axis", dimension: "y", show: true },
      ],
    },
    rows,
    geometry: { panelType: "matrix", rules: ["compile:matrix-heatmap"] },
    matchedRules: ["recipe-matrix", "geometry:matrix-heatmap", "mark:cell"],
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

function enrichNominalBarPanel(
  panel: PanelSpec,
  recipe: PanelRecipe,
  geometry: ChartGeometry,
): PanelSpec {
  const xField = recipe.xField ?? panel.encoding?.x?.field;
  if (!xField || !isNominalColorDimension(xField)) {
    return panel;
  }

  const isBar =
    geometry.markType === "bar" ||
    panel.marks?.some((mark) => mark.type === "bar");
  if (!isBar) {
    return panel;
  }

  return {
    ...panel,
    encoding: {
      ...panel.encoding,
      x: panel.encoding?.x ?? { field: xField },
      color: { field: xField, type: "nominal" },
    },
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

  const panel = enrichNominalBarPanel(result.panel, recipe, geometry);
  const xField = recipe.xField ?? panel.encoding?.x?.field;
  const categoryCount = xField
    ? new Set(rows.map((row) => String(row[xField]))).size
    : rows.length;
  const panelWithGeometry: PanelSpec = {
    ...panel,
    ...(geometry.orientation ? { orientation: geometry.orientation } : {}),
    ...(geometry.orientation === "horizontal" && categoryCount > 0
      ? { height: horizontalBarPanelHeight(categoryCount) }
      : {}),
  };

  const matchedRules = [
    ...result.matchedRules,
    ...geometry.rules,
    `mark:${geometry.markType ?? "bar"}`,
  ];
  if (panelWithGeometry.encoding?.color?.type === "nominal") {
    matchedRules.push("encoding:nominal-color");
  }
  if (!validation.ok) matchedRules.push("validation:needs-review");

  return {
    panel: { ...panelWithGeometry, title: recipe.title },
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

  if (recipe.stageOrder) {
    const orderField = recipe.groupBy ?? recipe.xField;
    if (orderField) {
      sortByStageOrder(chartRows, orderField, recipe.stageOrder);
    }
  }

  if (recipe.panelType === "funnel") {
    return compileDistributionFunnelPanel(recipe, chartRows);
  }

  if (recipe.panelType === "pie" || recipe.panelType === "donut") {
    return compileDistributionArcPanel(recipe, chartRows);
  }

  if (recipe.panelType === "matrix") {
    return compileMatrixPanel(recipe, chartRows);
  }

  const geometry = inferChartGeometry({
    kind: "chart",
    intent: recipe.intent,
    fieldProfiles: options.dataProfile?.fieldProfiles ?? [],
    xField: recipe.xField,
    yField: recipe.yField,
    yFields: recipe.yFields,
    dimensionKey: recipe.stageOrder ? "stage" : undefined,
    grain: options.dataProfile?.grain,
    timeSpan: options.dataProfile?.timeSpan,
    cardinalities: options.dataProfile?.cardinalities,
  });

  return compileCartesianPanel(recipe, chartRows, geometry, options);
}
