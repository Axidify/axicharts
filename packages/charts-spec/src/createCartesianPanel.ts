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

/** Filler phrasing with no chart semantics — agent should refine intent. */
const VAGUE_FILLER_RE =
  /\b(something|anything|whatever|stuff|things|cool|nice|pretty|sandwich|help\s+me|make\s+me\s+a|just\s+show)\b/i;

const BAR_INTENT_RE = /\b(bars?|bar chart|histogram|magnitude)\b/i;
const LINE_INTENT_RE = /\b(lines?|line chart|trend|latency|p95|over time|target line)\b/i;
const AREA_INTENT_RE = /\b(areas?|area chart|volume|cumulative|mrr)\b/i;

export type PlannerReviewReason = "no_data_mark" | "vague_intent" | null;

function pickXField(fields: string[]): string {
  return fields.find((field) => X_FIELD_RE.test(field)) ?? fields[0] ?? "x";
}

function pickNumericFields(fields: string[], xField: string): string[] {
  return fields.filter((field) => field !== xField);
}

function parseRuleValue(intent: string): number | null {
  const sloMatch = intent.match(
    /(?:slo|quota|threshold|limit)\s*(?:at|of)?\s*(\d+(?:\.\d+)?)\s*(?:ms)?/i,
  );
  return sloMatch?.[1] ? Number(sloMatch[1]) : null;
}

function parseBandRange(intent: string): { min: number; max: number } | null {
  const rangeMatch = intent.match(
    /healthy(?:\s*band)?\s*(\d+(?:\.\d+)?)\s*(?:ms)?\s*[-–]\s*(\d+(?:\.\d+)?)\s*(?:ms)?/i,
  );
  if (rangeMatch?.[1] && rangeMatch[2]) {
    return { min: Number(rangeMatch[1]), max: Number(rangeMatch[2]) };
  }

  const underMatch = intent.match(
    /healthy(?:\s*band)?\s*(?:under|below|<)\s*(\d+(?:\.\d+)?)\s*(?:ms)?/i,
  );
  if (underMatch?.[1]) {
    return { min: 0, max: Number(underMatch[1]) };
  }

  const betweenMatch = intent.match(
    /(?:healthy\s*)?band\s*(?:between\s*)?(\d+(?:\.\d+)?)\s*(?:and|to)\s*(\d+(?:\.\d+)?)\s*(?:ms)?/i,
  );
  if (betweenMatch?.[1] && betweenMatch[2]) {
    return { min: Number(betweenMatch[1]), max: Number(betweenMatch[2]) };
  }

  return null;
}

function isVagueIntent(intent: string): boolean {
  return VAGUE_FILLER_RE.test(intent);
}

export type CreateCartesianPanelInput = {
  intent: string;
  dataProfile?: DataProfile;
  fields?: string[];
  xField?: string;
  mode?: ChartMode;
  theme?: ThemeName;
};

export type CreateCartesianPanelResult = {
  panel: PanelSpec;
  needsReview: boolean;
  matchedRules: string[];
  reviewReason: PlannerReviewReason;
};

/**
 * Rules-first cartesian panel builder (C139 prototype).
 * Emits `type: "cartesian"` + `marks[]` only — validate before compile.
 *
 * Data marks (bar/line/area) are added only when intent names a mark type.
 * No silent fallback chart — vague or overlay-only intents return needsReview.
 */
export function createCartesianPanel(
  input: CreateCartesianPanelInput,
): CreateCartesianPanelResult {
  const intent = input.intent.toLowerCase();
  const fields =
    input.fields ??
    input.dataProfile?.fields ??
    input.dataProfile?.metrics?.map((metric) => metric.name) ??
    [];
  const xField = input.xField ?? pickXField(fields);
  const numericFields = pickNumericFields(fields, xField);
  const marks: ChartBlockMarkSpec[] = [];
  const matchedRules: string[] = [];

  const revenueField =
    numericFields.find((field) => /revenue|sales|throughput|volume/i.test(field)) ??
    numericFields[0];
  const targetField =
    numericFields.find((field) => /target|plan|forecast|margin/i.test(field)) ??
    numericFields.find((field) => field !== revenueField);

  if (BAR_INTENT_RE.test(intent) && revenueField) {
    matchedRules.push("bar");
    marks.push({
      type: "bar",
      field: revenueField,
      label: revenueField,
      ...(intent.includes("label") || intent.includes("value") ? { labels: true } : {}),
    });
  }

  if (LINE_INTENT_RE.test(intent) && (targetField ?? revenueField)) {
    matchedRules.push("line");
    marks.push({
      type: "line",
      field: targetField ?? revenueField!,
      label: targetField ?? revenueField,
      curve: intent.includes("smooth") ? "monotone" : undefined,
    });
  }

  if (AREA_INTENT_RE.test(intent) && revenueField) {
    matchedRules.push("area");
    marks.push({
      type: "area",
      field: revenueField,
      label: revenueField,
    });
  }

  const ruleValue = parseRuleValue(intent);
  if (ruleValue != null) {
    matchedRules.push("rule-slo");
    marks.push({
      type: "rule",
      value: ruleValue,
      label: "SLO",
      tone: "warning",
    });
  }

  const bandRange = parseBandRange(intent);
  if (bandRange) {
    matchedRules.push("band-healthy");
    marks.push({
      type: "band",
      min: bandRange.min,
      max: bandRange.max,
      label: "Healthy band",
      tone: "success",
    });
  }

  if (/stack/i.test(intent) && marks.filter((mark) => mark.type === "bar").length >= 2) {
    matchedRules.push("stack");
    for (const mark of marks) {
      if (mark.type === "bar") mark.stack = "default";
    }
  }

  if (/dual|secondary|right axis|margin/i.test(intent) && marks.length >= 2) {
    matchedRules.push("dual-axis");
    const dataMarks = marks.filter(
      (mark): mark is Extract<ChartBlockMarkSpec, { type: "line" | "bar" | "area" }> =>
        mark.type === "line" || mark.type === "bar" || mark.type === "area",
    );
    if (dataMarks[1]) dataMarks[1].yAxisId = "right";
  }

  const hasDataMark = matchedRules.some((rule) =>
    rule === "bar" || rule === "line" || rule === "area",
  );
  const vague = isVagueIntent(intent);
  const reviewReason: PlannerReviewReason = !hasDataMark
    ? vague
      ? "vague_intent"
      : "no_data_mark"
    : null;
  const needsReview = reviewReason != null;

  const panel: PanelSpec = {
    specVersion: 1,
    type: "cartesian",
    encoding: { x: { field: xField } },
    marks,
    mode: input.mode ?? (intent.includes("live") ? "live" : "interactive"),
    theme: input.theme ?? (intent.includes("studio") ? "studio" : "clean"),
    height: 260,
    props: {
      plannerMeta: {
        needsReview,
        reviewReason,
        matchedRules,
        intent: input.intent,
      },
    },
  };

  return { panel, needsReview, matchedRules, reviewReason };
}
