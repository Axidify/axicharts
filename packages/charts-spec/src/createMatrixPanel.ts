import type { ChartMode, DataProfile, MatrixMarkSpec, PanelSpec, ThemeName } from "./types";
import { detectIntentFamilyConflict } from "./intentFamilyConflict";
import { normalizeToMatrix } from "./normalizeToMatrix";

export type MatrixMarkCatalogEntry = {
  mark: MatrixMarkSpec["type"];
  role: "data" | "chrome";
  required: string[];
  optional?: string[];
};

export const MATRIX_MARK_CATALOG: MatrixMarkCatalogEntry[] = [
  { mark: "cell", role: "data", required: ["field"] },
  { mark: "colorScale", role: "chrome", required: [], optional: ["field", "min", "max", "scheme"] },
  { mark: "axis", role: "chrome", required: ["dimension"], optional: ["show"] },
];

export function listMatrixMarks(): MatrixMarkCatalogEntry[] {
  return MATRIX_MARK_CATALOG;
}

const HEATMAP_INTENT_RE =
  /\b(heatmap|heat\s*map|correlation|intensity|grid|matrix|2d)\b/i;

function pickXField(fields: string[]): string {
  return (
    fields.find((field) => /hour|day|week|month|x|column|category/i.test(field)) ??
    fields[0] ??
    "x"
  );
}

function pickYField(fields: string[], xField: string): string {
  return (
    fields.find(
      (field) =>
        field !== xField &&
        /hour|day|week|month|y|row|stage|region/i.test(field),
    ) ??
    fields.find((field) => field !== xField) ??
    "y"
  );
}

function pickValueField(fields: string[], xField: string, yField: string): string {
  return (
    fields.find(
      (field) =>
        field !== xField &&
        field !== yField &&
        /value|count|latency|amount|score|intensity|rate/i.test(field),
    ) ??
    fields.find((field) => field !== xField && field !== yField) ??
    "value"
  );
}

export type CreateMatrixPanelInput = {
  intent: string;
  dataProfile?: DataProfile;
  fields?: string[];
  xField?: string;
  yField?: string;
  valueField?: string;
  mode?: ChartMode;
  theme?: ThemeName;
};

export type CreateMatrixPanelResult = {
  panel: PanelSpec;
  needsReview: boolean;
  matchedRules: string[];
  reviewReason: "no_data_mark" | "vague_intent" | "conflicting_families" | null;
};

/**
 * Rules-first matrix panel builder (RFC-004 C186).
 */
export function createMatrixPanel(input: CreateMatrixPanelInput): CreateMatrixPanelResult {
  const intent = input.intent;
  const fields =
    input.fields ??
    input.dataProfile?.fields ??
    input.dataProfile?.metrics?.map((metric) => metric.name) ??
    [];

  const xField = input.xField ?? pickXField(fields);
  const yField = input.yField ?? pickYField(fields, xField);
  const valueField = input.valueField ?? pickValueField(fields, xField, yField);

  const marks: MatrixMarkSpec[] = [
    { type: "cell", field: valueField },
    { type: "colorScale", field: valueField },
    { type: "axis", dimension: "x", show: true },
    { type: "axis", dimension: "y", show: true },
  ];
  const matchedRules: string[] = ["mark:cell", "mark:colorScale", "mark:axis"];

  let needsReview = !HEATMAP_INTENT_RE.test(intent);
  let reviewReason: CreateMatrixPanelResult["reviewReason"] = needsReview
    ? "vague_intent"
    : null;
  if (detectIntentFamilyConflict(intent)) {
    needsReview = true;
    reviewReason = "conflicting_families";
  }

  const panel = normalizeToMatrix({
    specVersion: 1,
    type: "matrix",
    title: undefined,
    theme: input.theme ?? "clean",
    mode: input.mode ?? "static",
    encoding: {
      x: { field: xField, type: "nominal" },
      y: { field: yField, type: "nominal" },
      value: { field: valueField, type: "quantitative" },
    },
    marks,
  });

  return {
    panel,
    needsReview,
    matchedRules,
    reviewReason,
  };
}
