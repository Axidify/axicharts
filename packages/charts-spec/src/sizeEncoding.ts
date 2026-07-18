export type SizeScaleKind = "bar" | "point";

const DEFAULT_RANGES: Record<SizeScaleKind, [number, number]> = {
  bar: [0.35, 1],
  point: [3, 10],
};

function toNumeric(raw: unknown): number | null {
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "boolean") return raw ? 1 : 0;
  return null;
}

function linearScale(
  value: number,
  min: number,
  max: number,
  range: [number, number],
): number {
  if (max === min) return (range[0] + range[1]) / 2;
  const t = (value - min) / (max - min);
  return range[0] + t * (range[1] - range[0]);
}

/** Map a raw field value to a bar width fraction or point radius. */
export function resolveEncodingSize(
  raw: unknown,
  min: number,
  max: number,
  kind: SizeScaleKind,
  range?: [number, number],
): number {
  const outputRange = range ?? DEFAULT_RANGES[kind];
  const numeric = toNumeric(raw);
  if (numeric == null) return (outputRange[0] + outputRange[1]) / 2;
  return linearScale(numeric, min, max, outputRange);
}

export function sizesFromSizeField(
  rows: Record<string, unknown>[],
  field: string,
  kind: SizeScaleKind,
  range?: [number, number],
): number[] {
  const outputRange = range ?? DEFAULT_RANGES[kind];
  const numerics = rows
    .map((row) => toNumeric(row[field]))
    .filter((value): value is number => value != null);
  const min = numerics.length > 0 ? Math.min(...numerics) : 0;
  const max = numerics.length > 0 ? Math.max(...numerics) : 1;

  return rows.map((row) =>
    resolveEncodingSize(row[field], min, max, kind, outputRange),
  );
}
