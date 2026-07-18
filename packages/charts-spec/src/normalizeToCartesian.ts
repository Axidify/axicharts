import type { ChartBlockMarkSpec, FieldEncoding, PanelSpec } from "./types";
import { normalizeBlockMark, normalizeMarksArray } from "./cartesianMarks";

export type NormalizedCartesianSpec = PanelSpec & {
  type: "cartesian";
  marks: ChartBlockMarkSpec[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function encodingYToDataMark(item: FieldEncoding): ChartBlockMarkSpec | null {
  const kind = item.kind ?? "line";
  const markKind =
    kind === "bar" ? "bar" : kind === "area" ? "area" : "line";
  return {
    type: markKind,
    field: item.field,
    ...(item.label ? { label: item.label } : {}),
  };
}

function legacyReferenceLinesToMarks(
  props: Record<string, unknown> | undefined,
): ChartBlockMarkSpec[] {
  if (!props) return [];
  const lines = props.referenceLines;
  if (!Array.isArray(lines)) return [];
  const marks: ChartBlockMarkSpec[] = [];
  for (const raw of lines) {
    if (!isRecord(raw) || typeof raw.value !== "number") continue;
    marks.push({
      type: "rule",
      value: raw.value,
      ...(typeof raw.label === "string" ? { label: raw.label } : {}),
    });
  }
  return marks;
}

function legacyBandsToMarks(
  props: Record<string, unknown> | undefined,
): ChartBlockMarkSpec[] {
  if (!props) return [];
  const bands = props.thresholdBands;
  if (!Array.isArray(bands)) return [];
  const marks: ChartBlockMarkSpec[] = [];
  for (const raw of bands) {
    if (
      !isRecord(raw) ||
      typeof raw.min !== "number" ||
      typeof raw.max !== "number"
    ) {
      continue;
    }
    marks.push({
      type: "band",
      min: raw.min,
      max: raw.max,
      ...(typeof raw.label === "string" ? { label: raw.label } : {}),
    });
  }
  return marks;
}

/**
 * Normalize legacy panel types and mark aliases to `type: "cartesian"`.
 * Does not validate — call `validateCartesianSpec` after.
 */
export function normalizeToCartesian(spec: PanelSpec): NormalizedCartesianSpec {
  const base: PanelSpec = { ...spec };
  let marks: ChartBlockMarkSpec[] = [];

  if (spec.type === "cartesian" || spec.type === "blocks") {
    marks = normalizeMarksArray((spec.marks ?? []) as unknown[]);
  } else if (spec.type === "combo") {
    const y = spec.encoding?.y;
    const encodings = Array.isArray(y) ? y : y ? [y] : [];
    marks = encodings
      .map(encodingYToDataMark)
      .filter((m): m is ChartBlockMarkSpec => m != null);
  } else if (spec.type === "line" || spec.type === "bar" || spec.type === "area") {
    const y = spec.encoding?.y;
    const field = Array.isArray(y) ? y[0]?.field : y?.field;
    if (field) {
      marks = [
        {
          type: spec.type === "bar" ? "bar" : spec.type === "area" ? "area" : "line",
          field,
          ...(Array.isArray(y)
            ? y[0]?.label
              ? { label: y[0].label }
              : {}
            : y?.label
              ? { label: y.label }
              : {}),
        },
      ];
    }
  } else {
    return {
      ...base,
      type: "cartesian",
      marks: normalizeMarksArray((spec.marks ?? []) as unknown[]),
    };
  }

  marks = [
    ...marks,
    ...legacyReferenceLinesToMarks(spec.props),
    ...legacyBandsToMarks(spec.props),
  ];

  return {
    ...base,
    type: "cartesian",
    marks,
  };
}

/** Accept `mark` or `type` on raw JSON marks before normalize. */
export function normalizeRawCartesianPanel(raw: unknown): NormalizedCartesianSpec {
  if (!isRecord(raw)) {
    throw new Error("Panel spec must be an object");
  }
  const type = raw.type === "blocks" ? "cartesian" : (raw.type as PanelSpec["type"]);
  const marks = Array.isArray(raw.marks)
    ? raw.marks.map((m) => normalizeBlockMark(m)).filter((m): m is ChartBlockMarkSpec => m != null)
    : undefined;
  return normalizeToCartesian({
    ...(raw as PanelSpec),
    type,
    ...(marks ? { marks } : {}),
  });
}
