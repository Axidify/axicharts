import type { DistributionMarkSpec } from "./types";

const DATA_MARKS = new Set(["arc", "funnel"]);
const CHROME_MARKS = new Set(["donut", "cell", "label"]);
const ALL_MARKS = new Set([...DATA_MARKS, ...CHROME_MARKS]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isDistributionDataMark(
  mark: DistributionMarkSpec,
): mark is Extract<DistributionMarkSpec, { type: "arc" | "funnel" }> {
  return mark.type === "arc" || mark.type === "funnel";
}

export function normalizeDistributionMark(raw: unknown): DistributionMarkSpec | null {
  if (!isRecord(raw)) return null;
  const kind = raw.mark ?? raw.type;
  if (typeof kind !== "string") return null;

  if (kind === "arc") {
    if (typeof raw.field !== "string") return null;
    return {
      type: "arc",
      field: raw.field,
      ...(typeof raw.label === "string" ? { label: raw.label } : {}),
    };
  }

  if (kind === "funnel") {
    if (typeof raw.field !== "string") return null;
    return {
      type: "funnel",
      field: raw.field,
      ...(raw.sort === "ascending" || raw.sort === "descending" || raw.sort === "none"
        ? { sort: raw.sort }
        : {}),
    };
  }

  if (kind === "donut") {
    return {
      type: "donut",
      ...(typeof raw.innerRadius === "number" ? { innerRadius: raw.innerRadius } : {}),
    };
  }

  if (kind === "cell") {
    const dataKey = raw.dataKey ?? raw.field;
    if (typeof dataKey !== "string") return null;
    return {
      type: "cell",
      dataKey,
      ...(typeof raw.color === "string" ? { color: raw.color } : {}),
      ...(raw.tone === "default" ||
      raw.tone === "info" ||
      raw.tone === "success" ||
      raw.tone === "warning" ||
      raw.tone === "critical"
        ? { tone: raw.tone }
        : {}),
    };
  }

  if (kind === "label") {
    return {
      type: "label",
      ...(typeof raw.show === "boolean" ? { show: raw.show } : {}),
      ...(raw.position === "inside" || raw.position === "outside"
        ? { position: raw.position }
        : {}),
    };
  }

  return null;
}

export function normalizeDistributionMarks(raw: unknown[]): DistributionMarkSpec[] {
  const marks: DistributionMarkSpec[] = [];
  for (const item of raw) {
    const mark = normalizeDistributionMark(item);
    if (mark) marks.push(mark);
  }
  return marks;
}

export function distributionMarkKinds(): string[] {
  return [...ALL_MARKS];
}

export { ALL_MARKS as DISTRIBUTION_MARK_KINDS };

export type {
  DistributionArcMark,
  DistributionCellMark,
  DistributionDonutMark,
  DistributionFunnelMark,
  DistributionLabelMark,
  DistributionMarkSpec,
} from "./types";
