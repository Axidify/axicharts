import type { RidgelineItem, RidgelineSeries } from "@axicharts/charts-echarts";
import type { FieldEncoding } from "./types";

function buildCategoryItems(
  rows: Record<string, unknown>[],
  categoryField: string,
  valueField: string,
): RidgelineItem[] {
  const categories = [...new Set(rows.map((row) => String(row[categoryField])))];
  return categories.map((category) => ({
    category,
    samples: rows
      .filter((row) => String(row[categoryField]) === category)
      .map((row) => Number(row[valueField]))
      .filter((value) => Number.isFinite(value)),
  }));
}

export function ridgelineFromRows(
  rows: Record<string, unknown>[],
  props: Record<string, unknown>,
  encoding?: {
    x?: FieldEncoding;
    y?: FieldEncoding;
    series?: FieldEncoding;
  },
): { items: RidgelineItem[]; series: RidgelineSeries[] } {
  const items = props.items as RidgelineItem[] | undefined;
  const series = props.series as RidgelineSeries[] | undefined;
  if (items) {
    return { items, series: series ?? [] };
  }
  if (series) {
    return { items: [], series };
  }

  const categoryField =
    encoding?.x?.field ??
    (props.categoryField as string | undefined) ??
    "category";
  const valueField =
    encoding?.y?.field ?? (props.valueField as string | undefined) ?? "value";
  const seriesField =
    encoding?.series?.field ?? (props.seriesField as string | undefined);

  if (seriesField) {
    const seriesNames = [
      ...new Set(rows.map((row) => String(row[seriesField]))),
    ];
    return {
      items: [],
      series: seriesNames.map((name) => ({
        name,
        items: buildCategoryItems(
          rows.filter((row) => String(row[seriesField]) === name),
          categoryField,
          valueField,
        ),
      })),
    };
  }

  return {
    items: buildCategoryItems(rows, categoryField, valueField),
    series: [],
  };
}
