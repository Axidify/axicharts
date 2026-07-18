import type { CalendarHeatmapData, CalendarHeatmapPoint } from "@axicharts/charts-echarts";
import type { FieldEncoding } from "./types";

export function inferCalendarYear(data: CalendarHeatmapData): number {
  if (data.year != null) {
    return data.year;
  }

  if (data.points.length > 0) {
    const year = Number.parseInt(data.points[0]!.date.slice(0, 4), 10);
    if (!Number.isNaN(year)) {
      return year;
    }
  }

  return new Date().getFullYear();
}

export function calendarFromRows(
  rows: Record<string, unknown>[],
  encoding?: {
    date?: FieldEncoding;
    value?: FieldEncoding;
    x?: FieldEncoding;
    y?: FieldEncoding | FieldEncoding[];
  },
): CalendarHeatmapPoint[] {
  const yEncoding = Array.isArray(encoding?.y) ? encoding?.y[0] : encoding?.y;
  const dateField = encoding?.date?.field ?? encoding?.x?.field ?? "date";
  const valueField = encoding?.value?.field ?? yEncoding?.field ?? "value";

  return rows.map((row) => ({
    date: String(row[dateField]),
    value: Number(row[valueField]),
  }));
}

export function resolveCalendarHeatmapData(
  rows: Record<string, unknown>[],
  props: Record<string, unknown>,
  encoding?: {
    date?: FieldEncoding;
    value?: FieldEncoding;
    x?: FieldEncoding;
    y?: FieldEncoding | FieldEncoding[];
  },
): CalendarHeatmapData {
  const fromProps = props.data as CalendarHeatmapData | undefined;
  if (fromProps) {
    return fromProps;
  }

  const pointsFromProps = props.points as CalendarHeatmapPoint[] | undefined;
  const points =
    rows.length > 0 ? calendarFromRows(rows, encoding) : (pointsFromProps ?? []);

  return {
    points,
    year: props.year as number | undefined,
    range: props.range as [string, string] | undefined,
  };
}
