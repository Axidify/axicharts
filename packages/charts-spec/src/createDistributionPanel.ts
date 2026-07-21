import type { ChartMode, DataProfile, DistributionMarkSpec, PanelSpec, ThemeName } from "./types";
import { normalizeToDistribution } from "./normalizeToDistribution";

export type DistributionMarkCatalogEntry = {
  mark: DistributionMarkSpec["type"];
  role: "data" | "chrome";
  required: string[];
  optional?: string[];
};

export const DISTRIBUTION_MARK_CATALOG: DistributionMarkCatalogEntry[] = [
  { mark: "arc", role: "data", required: ["field"], optional: ["label"] },
  { mark: "funnel", role: "data", required: ["field"], optional: ["sort"] },
  { mark: "donut", role: "chrome", required: [], optional: ["innerRadius"] },
  { mark: "cell", role: "chrome", required: ["dataKey"], optional: ["tone", "color"] },
  { mark: "label", role: "chrome", required: [], optional: ["show", "position"] },
];

export function listDistributionMarks(): DistributionMarkCatalogEntry[] {
  return DISTRIBUTION_MARK_CATALOG;
}

const DONUT_INTENT_RE = /\b(donut|doughnut|ring)\b/i;
const PIE_INTENT_RE = /\b(pie|share|breakdown|distribution|composition|portion)\b/i;
const LABEL_INTENT_RE = /\b(label|percent|%)\b/i;

function pickAngleField(fields: string[]): string {
  return (
    fields.find((field) => /value|amount|count|share|percent|revenue|total/i.test(field)) ??
    fields.find((field) => field !== fields[0]) ??
    "value"
  );
}

function pickColorField(fields: string[], angleField: string): string {
  return (
    fields.find(
      (field) =>
        field !== angleField &&
        /name|category|browser|status|stage|type|label/i.test(field),
    ) ??
    fields.find((field) => field !== angleField) ??
    "name"
  );
}

export type CreateDistributionPanelInput = {
  intent: string;
  dataProfile?: DataProfile;
  fields?: string[];
  angleField?: string;
  colorField?: string;
  mode?: ChartMode;
  theme?: ThemeName;
};

export type CreateDistributionPanelResult = {
  panel: PanelSpec;
  needsReview: boolean;
  matchedRules: string[];
  reviewReason: "no_data_mark" | "vague_intent" | null;
};

/**
 * Rules-first distribution panel builder (RFC-004 C181).
 */
export function createDistributionPanel(
  input: CreateDistributionPanelInput,
): CreateDistributionPanelResult {
  const intent = input.intent;
  const lower = intent.toLowerCase();
  const fields =
    input.fields ??
    input.dataProfile?.fields ??
    input.dataProfile?.metrics?.map((metric) => metric.name) ??
    [];

  const angleField = input.angleField ?? pickAngleField(fields);
  const colorField = input.colorField ?? pickColorField(fields, angleField);
  const marks: DistributionMarkSpec[] = [{ type: "arc", field: angleField }];
  const matchedRules: string[] = ["mark:arc"];

  if (DONUT_INTENT_RE.test(intent) || lower.includes("donut")) {
    marks.push({ type: "donut", innerRadius: 42 });
    matchedRules.push("mark:donut");
  } else if (PIE_INTENT_RE.test(intent)) {
    matchedRules.push("intent:pie");
  }

  if (LABEL_INTENT_RE.test(intent) || PIE_INTENT_RE.test(intent)) {
    marks.push({ type: "label", show: true });
    matchedRules.push("mark:label");
  }

  const needsReview = !PIE_INTENT_RE.test(intent) && !DONUT_INTENT_RE.test(intent);

  const panel = normalizeToDistribution({
    specVersion: 1,
    type: "distribution",
    title: undefined,
    theme: input.theme ?? "clean",
    mode: input.mode ?? "static",
    encoding: {
      angle: { field: angleField, type: "quantitative" },
      color: { field: colorField, type: "nominal" },
    },
    marks,
  });

  return {
    panel,
    needsReview,
    matchedRules,
    reviewReason: needsReview ? "vague_intent" : null,
  };
}
