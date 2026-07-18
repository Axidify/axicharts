import type { ChartBlockMarkSpec, ChartMode, DataProfile, PanelSpec, ThemeName } from "./types";

export type CartesianMarkCatalogEntry = {
  mark: ChartBlockMarkSpec["type"];
  role: "data" | "overlay";
  required: string[];
  optional?: string[];
};

export const CARTESIAN_MARK_CATALOG: CartesianMarkCatalogEntry[] = [
  { mark: "bar", role: "data", required: ["field"], optional: ["label", "tone", "stack", "labels", "yAxisId"] },
  { mark: "line", role: "data", required: ["field"], optional: ["label", "tone", "curve", "yAxisId"] },
  { mark: "area", role: "data", required: ["field"], optional: ["label", "tone", "curve", "yAxisId"] },
  { mark: "rule", role: "overlay", required: ["value"], optional: ["label", "tone", "orientation"] },
  { mark: "band", role: "overlay", required: ["min", "max"], optional: ["label", "tone"] },
];

export function listCartesianMarks(): CartesianMarkCatalogEntry[] {
  return CARTESIAN_MARK_CATALOG;
}

const X_FIELD_RE = /week|month|day|hour|date|time|period|quarter/i;

function pickXField(fields: string[]): string {
  return fields.find((field) => X_FIELD_RE.test(field)) ?? fields[0] ?? "x";
}

function pickNumericFields(fields: string[], xField: string): string[] {
  return fields.filter((field) => field !== xField);
}

export type CreateCartesianPanelInput = {
  intent: string;
  dataProfile?: DataProfile;
  fields?: string[];
  xField?: string;
  mode?: ChartMode;
  theme?: ThemeName;
};

/**
 * Rules-first cartesian panel builder (C139 prototype).
 * Emits `type: "cartesian"` + `marks[]` only — validate before compile.
 */
export function createCartesianPanel(input: CreateCartesianPanelInput): PanelSpec {
  const intent = input.intent.toLowerCase();
  const fields =
    input.fields ??
    input.dataProfile?.fields ??
    input.dataProfile?.metrics?.map((metric) => metric.name) ??
    [];
  const xField = input.xField ?? pickXField(fields);
  const numericFields = pickNumericFields(fields, xField);
  const marks: ChartBlockMarkSpec[] = [];

  const revenueField =
    numericFields.find((field) => /revenue|sales|throughput|volume/i.test(field)) ??
    numericFields[0];
  const targetField =
    numericFields.find((field) => /target|plan|forecast|margin/i.test(field)) ??
    numericFields.find((field) => field !== revenueField);

  if (/bar|magnitude|revenue|sales|histogram/i.test(intent) && revenueField) {
    marks.push({
      type: "bar",
      field: revenueField,
      label: revenueField,
      ...(intent.includes("label") || intent.includes("value") ? { labels: true } : {}),
    });
  }

  if (/line|trend|latency|p95|over time/i.test(intent) && (targetField ?? revenueField)) {
    marks.push({
      type: "line",
      field: targetField ?? revenueField!,
      label: targetField ?? revenueField,
      curve: intent.includes("smooth") ? "monotone" : undefined,
    });
  }

  if (/area|volume|cumulative|mrr/i.test(intent) && revenueField) {
    marks.push({
      type: "area",
      field: revenueField,
      label: revenueField,
    });
  }

  if (marks.length === 0 && revenueField) {
    marks.push({ type: "line", field: revenueField, label: revenueField });
  }

  const sloMatch = intent.match(/(?:slo|quota|threshold|limit)\s*(?:at|of)?\s*(\d+(?:\.\d+)?)/i);
  if (sloMatch?.[1]) {
    marks.push({
      type: "rule",
      value: Number(sloMatch[1]),
      label: "SLO",
      tone: "warning",
    });
  }

  const bandMatch = intent.match(/healthy(?:\s*band)?\s*(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)/i);
  if (bandMatch?.[1] && bandMatch[2]) {
    marks.push({
      type: "band",
      min: Number(bandMatch[1]),
      max: Number(bandMatch[2]),
      label: "Healthy band",
      tone: "success",
    });
  }

  if (/stack/i.test(intent) && marks.filter((mark) => mark.type === "bar").length >= 2) {
    for (const mark of marks) {
      if (mark.type === "bar") mark.stack = "default";
    }
  }

  if (/dual|secondary|right axis|margin/i.test(intent) && marks.length >= 2) {
    const dataMarks = marks.filter(
      (mark): mark is Extract<ChartBlockMarkSpec, { type: "line" | "bar" | "area" }> =>
        mark.type === "line" || mark.type === "bar" || mark.type === "area",
    );
    if (dataMarks[1]) dataMarks[1].yAxisId = "right";
  }

  return {
    specVersion: 1,
    type: "cartesian",
    encoding: { x: { field: xField } },
    marks,
    mode: input.mode ?? (intent.includes("live") ? "live" : "interactive"),
    theme: input.theme ?? (intent.includes("studio") ? "studio" : "clean"),
    height: 260,
  };
}
