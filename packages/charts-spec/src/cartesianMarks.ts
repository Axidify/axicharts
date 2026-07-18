import type {
  ChartBlockBandMark,
  ChartBlockMarkSpec,
  ChartBlockRuleMark,
  ChartBlockSeriesMark,
} from "./types";

const DATA_MARKS = new Set(["bar", "line", "area"]);

export function isDataMark(
  mark: ChartBlockMarkSpec,
): mark is ChartBlockSeriesMark {
  return DATA_MARKS.has(mark.type);
}

export function isOverlayMark(mark: ChartBlockMarkSpec): boolean {
  return mark.type === "rule" || mark.type === "band";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

type SeriesTone = ChartBlockSeriesMark["tone"];

function readTone(value: unknown): SeriesTone | undefined {
  if (
    value === "default" ||
    value === "info" ||
    value === "success" ||
    value === "warning" ||
    value === "critical"
  ) {
    return value;
  }
  return undefined;
}

/** Normalize RFC `mark` key to internal `type` key. */
export function normalizeBlockMark(raw: unknown): ChartBlockMarkSpec | null {
  if (!isRecord(raw)) return null;
  const kind = raw.mark ?? raw.type;
  if (typeof kind !== "string") return null;

  if (kind === "bar" || kind === "line" || kind === "area") {
    if (typeof raw.field !== "string") return null;
    const mark: ChartBlockSeriesMark = {
      type: kind,
      field: raw.field,
    };
    if (typeof raw.label === "string") mark.label = raw.label;
    const tone = readTone(raw.tone);
    if (tone) mark.tone = tone;
    if (raw.yAxisId === "left" || raw.yAxisId === "right") {
      mark.yAxisId = raw.yAxisId;
    }
    if (raw.curve === "linear" || raw.curve === "monotone") {
      mark.curve = raw.curve;
    }
    return mark;
  }

  if (kind === "rule") {
    if (typeof raw.value !== "number") return null;
    const mark: ChartBlockRuleMark = { type: "rule", value: raw.value };
    if (typeof raw.label === "string") mark.label = raw.label;
    const tone = readTone(raw.tone);
    if (tone) mark.tone = tone;
    if (raw.orientation === "horizontal" || raw.orientation === "vertical") {
      mark.orientation = raw.orientation;
    }
    return mark;
  }

  if (kind === "band") {
    if (typeof raw.min !== "number" || typeof raw.max !== "number") return null;
    const mark: ChartBlockBandMark = {
      type: "band",
      min: raw.min,
      max: raw.max,
    };
    if (typeof raw.label === "string") mark.label = raw.label;
    const tone = readTone(raw.tone);
    if (tone) mark.tone = tone;
    return mark;
  }

  return null;
}

export function normalizeMarksArray(marks: unknown[]): ChartBlockMarkSpec[] {
  const out: ChartBlockMarkSpec[] = [];
  for (const raw of marks) {
    const mark = normalizeBlockMark(raw);
    if (mark) out.push(mark);
  }
  return out;
}
