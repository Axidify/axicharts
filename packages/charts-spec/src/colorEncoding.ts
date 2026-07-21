import { resolveNominalFill } from "./nominalColorMap";

type SemanticTone =
  | "default"
  | "info"
  | "success"
  | "warning"
  | "critical";
const SERIES_COLORS: Record<SemanticTone, string> = {
  default: "#2563eb",
  info: "#0891b2",
  success: "#16a34a",
  warning: "#d97706",
  critical: "#dc2626",
};

const SERIES_PALETTE = [
  "#2563eb",
  "#0891b2",
  "#16a34a",
  "#d97706",
  "#7c3aed",
  "#db2777",
] as const;

const SEMANTIC_TONES = new Set<string>([
  "default",
  "info",
  "success",
  "warning",
  "critical",
]);

function resolvePaletteColor(index: number): string {
  return SERIES_PALETTE[index % SERIES_PALETTE.length]!;
}

/** Map spec / AI color field values to canvas fill colors. */
export function resolveEncodingFill(
  raw: unknown,
  index: number,
  fallback?: string,
): string {
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (SEMANTIC_TONES.has(trimmed)) {
      return SERIES_COLORS[trimmed as SemanticTone];
    }
    const nominal = resolveNominalFill(trimmed);
    if (nominal) return nominal;
    if (
      trimmed.startsWith("#") ||
      trimmed.startsWith("hsl") ||
      trimmed.startsWith("rgb") ||
      trimmed.startsWith("var(")
    ) {
      return trimmed;
    }
  }
  if (typeof raw === "boolean") {
    // success / warning matches dashboard “above vs below target” (Recharts wall Cells).
    return raw ? SERIES_COLORS.success : SERIES_COLORS.warning;
  }
  if (typeof raw === "number") {
    return raw >= 0 ? SERIES_COLORS.success : SERIES_COLORS.critical;
  }
  return fallback ?? resolvePaletteColor(index);
}

export function fillsFromColorField(
  rows: Record<string, unknown>[],
  field: string,
  fallback?: string,
): string[] {
  return rows.map((row, index) =>
    resolveEncodingFill(row[field], index, fallback),
  );
}

type ColorEncodableSeries = {
  kind?: string;
  color?: string;
  fills?: string[];
};

/** Apply `encoding.color` fills to the primary bar series (cartesian + bar compile paths). */
export function applyColorEncodingToBarSeries<T extends ColorEncodableSeries>(
  rows: Record<string, unknown>[],
  colorField: string | undefined,
  series: T[],
): T[] {
  if (!colorField || series.length === 0) return series;
  const barIndex = series.findIndex((item) => item.kind === "bar");
  const targetIndex = barIndex >= 0 ? barIndex : 0;
  const target = series[targetIndex];
  if (!target || (target.kind && target.kind !== "bar")) return series;
  const fills = fillsFromColorField(rows, colorField, target.color);
  return series.map((item, index) =>
    index === targetIndex ? { ...item, fills } : item,
  );
}
