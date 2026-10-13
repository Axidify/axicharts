import type { ComboSeries, ComboSeriesKind } from "@axicharts/charts-canvas";
import type { FieldEncoding } from "./types";
import { pluckField } from "./data";

export function comboSeriesFromEncoding(
  rows: Record<string, unknown>[],
  encoding: FieldEncoding | FieldEncoding[] | undefined,
): ComboSeries[] {
  if (!encoding) return [];
  const encodings = Array.isArray(encoding) ? encoding : [encoding];
  return encodings.map((item, index) => {
    const data = pluckField(rows, { ...item, type: "quantitative" }) as number[];
    // Combo renderers draw every non-bar series as a line, so an `area` y
    // channel renders as a line here.
    const kind: ComboSeriesKind =
      item.kind === "area" ? "line" : item.kind ?? (index === 0 ? "bar" : "line");
    return {
      name: item.label ?? item.field,
      data,
      kind,
    };
  });
}
