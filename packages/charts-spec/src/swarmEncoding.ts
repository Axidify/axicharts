import type { SwarmItem, SwarmSeries } from "@axicharts/charts-echarts";
import type { FieldEncoding } from "./types";

function buildCategoryItems(
  rows: Record<string, unknown>[],
  categoryField: string,
  valueField: string,
): SwarmItem[] {
  const categories = [...new Set(rows.map((row) => String(row[categoryField])))];
  return categories.map((category) => ({
    category,
    values: rows
      .filter((row) => String(row[categoryField]) === category)
      .map((row) => Number(row[valueField]))
      .filter((value) => Number.isFinite(value)),
  }));
}

export function swarmFromRows(
  rows: Record<string, unknown>[],
  props: Record<string, unknown>,
  encoding?: {
    x?: FieldEncoding;
    y?: FieldEncoding;
    series?: FieldEncoding;
  },
): { items: SwarmItem[]; series: SwarmSeries[] } {
  const items = props.items as SwarmItem[] | undefined;
  const series = props.series as SwarmSeries[] | undefined;
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
