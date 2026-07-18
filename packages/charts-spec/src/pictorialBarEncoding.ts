import type { PictorialBarData, PictorialBarItem } from "@axicharts/charts-echarts";
import type { FieldEncoding } from "./types";

export function pictorialBarFromRows(
  rows: Record<string, unknown>[],
  encoding?: {
    x?: FieldEncoding;
    y?: FieldEncoding | FieldEncoding[];
    category?: FieldEncoding;
    value?: FieldEncoding;
  },
): PictorialBarItem[] {
  const yEncoding = Array.isArray(encoding?.y) ? encoding?.y[0] : encoding?.y;
  const categoryField =
    encoding?.category?.field ?? encoding?.x?.field ?? "category";
  const valueField =
    encoding?.value?.field ?? yEncoding?.field ?? "value";

  return rows.map((row) => ({
    category: String(row[categoryField]),
    value: Number(row[valueField]),
    symbol: row.symbol as string | undefined,
    color: row.color as string | undefined,
    tone: row.tone as PictorialBarItem["tone"],
  }));
}

export function resolvePictorialBarData(
  rows: Record<string, unknown>[],
  props: Record<string, unknown>,
  encoding?: {
    x?: FieldEncoding;
    y?: FieldEncoding | FieldEncoding[];
    category?: FieldEncoding;
    value?: FieldEncoding;
  },
): PictorialBarData {
  const fromProps = props.data as PictorialBarData | undefined;
  if (fromProps) {
    return fromProps;
  }

  const itemsFromProps = props.items as PictorialBarItem[] | undefined;
  const items =
    rows.length > 0 ? pictorialBarFromRows(rows, encoding) : (itemsFromProps ?? []);

  return {
    items,
    symbol: props.symbol as string | undefined,
  };
}
