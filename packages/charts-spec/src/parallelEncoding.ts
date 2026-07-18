import type { ParallelDimension, ParallelSeries } from "@axicharts/charts-echarts";
import type { ThemeRiverPoint } from "@axicharts/charts-echarts";
import type { FieldEncoding } from "./types";

function dimensionField(dimension: ParallelDimension): string {
  return dimension.field ?? dimension.name.toLowerCase().replace(/\s+/g, "_");
}

export function parallelFromRows(
  rows: Record<string, unknown>[],
  props: Record<string, unknown>,
  encoding?: {
    name?: FieldEncoding;
    series?: FieldEncoding;
  },
): { dimensions: ParallelDimension[]; series: ParallelSeries[] } {
  const dimensions =
    (props.dimensions as ParallelDimension[] | undefined) ?? [];
  const nameField =
    encoding?.name?.field ?? (props.nameField as string | undefined) ?? "name";

  const fromProps = props.series as ParallelSeries[] | undefined;
  if (fromProps) {
    return { dimensions, series: fromProps };
  }

  const resolvedDimensions =
    dimensions.length > 0
      ? dimensions
      : inferParallelDimensions(rows, props);

  const series = rows.map((row, index) => {
    const valuesArray = row.values;
    if (Array.isArray(valuesArray)) {
      return {
        name: String(row[nameField] ?? `Row ${index + 1}`),
        values: valuesArray.map((value) => Number(value)),
      };
    }

    return {
      name: String(row[nameField] ?? `Row ${index + 1}`),
      values: resolvedDimensions.map((dimension) =>
        Number(row[dimensionField(dimension)] ?? 0),
      ),
    };
  });

  return { dimensions: resolvedDimensions, series };
}

function inferParallelDimensions(
  rows: Record<string, unknown>[],
  props: Record<string, unknown>,
): ParallelDimension[] {
  const fields = (props.dimensionFields as string[] | undefined) ?? [];
  if (fields.length > 0) {
    return fields.map((field) => ({ name: field, field }));
  }

  if (rows.length === 0) {
    return [];
  }

  const sample = rows[0] ?? {};
  return Object.keys(sample)
    .filter((key) => key !== "name" && key !== "values" && typeof sample[key] === "number")
    .map((field) => ({ name: field, field }));
}

export function themeRiverFromRows(
  rows: Record<string, unknown>[],
  props: Record<string, unknown>,
  encoding?: {
    x?: FieldEncoding;
    value?: FieldEncoding;
    series?: FieldEncoding;
  },
): { points: ThemeRiverPoint[] } {
  const fromProps = props.points as ThemeRiverPoint[] | undefined;
  if (fromProps) {
    return { points: fromProps };
  }

  const timeField =
    encoding?.x?.field ?? (props.timeField as string | undefined) ?? "date";
  const valueField =
    encoding?.value?.field ?? (props.valueField as string | undefined) ?? "value";
  const seriesField =
    encoding?.series?.field ??
    (props.seriesField as string | undefined) ??
    "series";

  return {
    points: rows.map((row) => ({
      time: row[timeField] as string | number,
      value: Number(row[valueField]),
      series: String(row[seriesField]),
    })),
  };
}
