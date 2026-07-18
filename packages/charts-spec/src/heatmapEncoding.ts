import type { HeatmapMatrix } from "@axicharts/charts-echarts";
import type { FieldEncoding } from "./types";
import { pluckField } from "./data";

export function matrixFromRows(
  rows: Record<string, unknown>[],
  xField: string,
  yField: string,
  valueField: string,
): HeatmapMatrix {
  const xCategories = [
    ...new Set(rows.map((row) => String(row[xField]))),
  ];
  const yCategories = [
    ...new Set(rows.map((row) => String(row[yField]))),
  ];

  const values = yCategories.map((y) =>
    xCategories.map((x) => {
      const match = rows.find(
        (row) => String(row[xField]) === x && String(row[yField]) === y,
      );
      return match ? Number(match[valueField]) : 0;
    }),
  );

  return { xCategories, yCategories, values };
}

export function resolveHeatmapMatrix(
  rows: Record<string, unknown>[],
  props: Record<string, unknown>,
  encoding?: {
    x?: FieldEncoding;
    y?: FieldEncoding | FieldEncoding[];
    value?: FieldEncoding;
  },
): HeatmapMatrix {
  const fromProps = props.matrix as HeatmapMatrix | undefined;
  if (fromProps) {
    return fromProps;
  }

  const yEncoding = Array.isArray(encoding?.y) ? encoding?.y[0] : encoding?.y;
  const xField = encoding?.x?.field ?? (props.xField as string | undefined) ?? "x";
  const yField = yEncoding?.field ?? (props.yField as string | undefined) ?? "y";
  const valueField =
    encoding?.value?.field ?? (props.valueField as string | undefined) ?? "value";

  if (rows.length > 0) {
    return matrixFromRows(rows, xField, yField, valueField);
  }

  return {
    xCategories: (props.xCategories as string[]) ?? [],
    yCategories: (props.yCategories as string[]) ?? [],
    values: (props.values as number[][]) ?? [],
  };
}

export function radarFromRows(
  rows: Record<string, unknown>[],
  props: Record<string, unknown>,
  encoding?: {
    name?: FieldEncoding;
    value?: FieldEncoding;
    series?: FieldEncoding;
  },
) {
  const indicators =
    (props.indicators as Array<{ name: string; max?: number }>) ??
    (encoding?.name
      ? [...new Set(pluckField(rows, encoding.name).map(String))].map((name) => ({
          name,
        }))
      : []);

  const seriesField = encoding?.series?.field ?? (props.seriesField as string | undefined);
  const valueField =
    encoding?.value?.field ?? (props.valueField as string | undefined) ?? "value";
  const nameField =
    encoding?.name?.field ?? (props.nameField as string | undefined) ?? "name";

  if (seriesField) {
    const groups = [...new Set(rows.map((row) => String(row[seriesField])))];
    return {
      indicators,
      series: groups.map((group) => ({
        name: group,
        values: indicators.map((indicator) => {
          const match = rows.find(
            (row) =>
              String(row[seriesField]) === group &&
              String(row[nameField]) === indicator.name,
          );
          return match ? Number(match[valueField]) : 0;
        }),
      })),
    };
  }

  const fromProps = props.series as Array<{ name: string; values: number[] }> | undefined;
  if (fromProps) {
    return { indicators, series: fromProps };
  }

  return {
    indicators,
    series: [
      {
        name: "Series",
        values: indicators.map((indicator) => {
          const match = rows.find((row) => String(row[nameField]) === indicator.name);
          return match ? Number(match[valueField]) : 0;
        }),
      },
    ],
  };
}
