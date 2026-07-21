import type { MatrixMarkSpec } from "./types";

const DATA_MARKS = new Set(["cell"]);
const CHROME_MARKS = new Set(["colorScale", "axis"]);
const ALL_MARKS = new Set([...DATA_MARKS, ...CHROME_MARKS]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isMatrixDataMark(
  mark: MatrixMarkSpec,
): mark is Extract<MatrixMarkSpec, { type: "cell" }> {
  return mark.type === "cell";
}

export function normalizeMatrixMark(raw: unknown): MatrixMarkSpec | null {
  if (!isRecord(raw)) return null;
  const kind = raw.mark ?? raw.type;
  if (typeof kind !== "string") return null;

  if (kind === "cell") {
    const field = raw.field ?? raw.valueField;
    if (typeof field !== "string") return null;
    return { type: "cell", field };
  }

  if (kind === "colorScale") {
    return {
      type: "colorScale",
      ...(typeof raw.field === "string" ? { field: raw.field } : {}),
      ...(typeof raw.min === "number" ? { min: raw.min } : {}),
      ...(typeof raw.max === "number" ? { max: raw.max } : {}),
      ...(typeof raw.scheme === "string" ? { scheme: raw.scheme } : {}),
    };
  }

  if (kind === "axis") {
    if (raw.dimension !== "x" && raw.dimension !== "y") return null;
    return {
      type: "axis",
      dimension: raw.dimension,
      ...(typeof raw.show === "boolean" ? { show: raw.show } : {}),
    };
  }

  return null;
}

export function normalizeMatrixMarks(raw: unknown[]): MatrixMarkSpec[] {
  const marks: MatrixMarkSpec[] = [];
  for (const item of raw) {
    const mark = normalizeMatrixMark(item);
    if (mark) marks.push(mark);
  }
  return marks;
}

export function matrixMarkKinds(): string[] {
  return [...ALL_MARKS];
}

export { ALL_MARKS as MATRIX_MARK_KINDS };
