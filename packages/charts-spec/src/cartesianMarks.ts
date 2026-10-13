import type {
  ChartBlockBandMark,
  ChartBlockMarkerMark,
  ChartBlockMarkSpec,
  ChartBlockRuleMark,
  ChartBlockSeriesMark,
  ChartBlockTextMark,
} from "./types";

const DATA_MARKS = new Set(["bar", "line", "area", "point"]);

export function isDataMark(
  mark: ChartBlockMarkSpec,
): mark is ChartBlockSeriesMark {
  return DATA_MARKS.has(mark.type);
}

export function isOverlayMark(mark: ChartBlockMarkSpec): boolean {
  return OVERLAY_MARK_TYPES.has(mark.type);
}

/** Overlay (non-data) cartesian mark types. */
export const OVERLAY_MARK_TYPES: ReadonlySet<string> = new Set([
  "rule",
  "band",
  "text",
  "marker",
]);

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

function readX(value: unknown): number | string | undefined {
  return typeof value === "number" || typeof value === "string" ? value : undefined;
}

function readId(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

/** Normalize RFC `mark` key to internal `type` key. */
export function normalizeBlockMark(raw: unknown): ChartBlockMarkSpec | null {
  if (!isRecord(raw)) return null;
  const kind = raw.mark ?? raw.type;
  if (typeof kind !== "string") return null;

  if (kind === "bar" || kind === "line" || kind === "area" || kind === "point") {
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
    if (typeof raw.stack === "string" && raw.stack.length > 0) {
      mark.stack = raw.stack;
    }
    if (raw.labels === true) {
      mark.labels = true;
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
    const x = readX(raw.x);
    if (x != null) mark.x = x;
    const id = readId(raw.id);
    if (id) mark.id = id;
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
    const id = readId(raw.id);
    if (id) mark.id = id;
    return mark;
  }

  if (kind === "text") {
    if (typeof raw.text !== "string" || typeof raw.y !== "number") return null;
    const mark: ChartBlockTextMark = { type: "text", text: raw.text, y: raw.y };
    const x = readX(raw.x);
    if (x != null) mark.x = x;
    const tone = readTone(raw.tone);
    if (tone) mark.tone = tone;
    if (
      raw.position === "top" ||
      raw.position === "bottom" ||
      raw.position === "left" ||
      raw.position === "right" ||
      raw.position === "center"
    ) {
      mark.position = raw.position;
    }
    const id = readId(raw.id);
    if (id) mark.id = id;
    return mark;
  }

  if (kind === "marker") {
    if (typeof raw.y !== "number") return null;
    const mark: ChartBlockMarkerMark = { type: "marker", y: raw.y };
    const x = readX(raw.x);
    if (x != null) mark.x = x;
    if (typeof raw.label === "string") mark.label = raw.label;
    const tone = readTone(raw.tone);
    if (tone) mark.tone = tone;
    if (raw.draggable === true) mark.draggable = true;
    const id = readId(raw.id);
    if (id) mark.id = id;
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
