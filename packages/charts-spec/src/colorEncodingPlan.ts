import type { ColorEncoding, MetricProfile, PanelSpec } from "./types";

const COLOR_FIELD_PRIORITY = [
  "aboveTarget",
  "above_target",
  "onTarget",
  "on_target",
  "vsPlan",
  "vs_plan",
  "meetsSlo",
  "meets_slo",
  "aboveSlo",
  "above_slo",
  "healthy",
  "ok",
  "passed",
  "alarm",
  "alarmed",
  "severity",
  "status",
] as const;

function normalizeFieldName(field: string): string {
  return field.toLowerCase().replace(/_/g, "");
}

export function findProfileColorField(fields: string[]): string | undefined {
  const byNormalized = new Map(
    fields.map((field) => [normalizeFieldName(field), field]),
  );

  for (const candidate of COLOR_FIELD_PRIORITY) {
    const match = byNormalized.get(normalizeFieldName(candidate));
    if (match) return match;
  }

  return undefined;
}

export function intentWantsColorEncoding(intent?: string): boolean {
  if (!intent) return false;
  return /above\s*target|vs\s*plan|vs\s*target|color\s*by|threshold|on[\s-]?target|meets?\s*slo|above\s*slo|alarm|healthy|pass\s*\/\s*fail|good\s*\/\s*bad|semantic\s*color|target\s*met/i.test(
    intent,
  );
}

function metricSuggestsConditionalColor(metric: MetricProfile): boolean {
  const name = metric.name.toLowerCase();
  return /throughput|latency|rate|sla|target|utilization|yield|uptime|error|defect|p\d+|cpu|memory|queue/.test(
    name,
  );
}

function isCartesianPanelType(type: PanelSpec["type"]): boolean {
  return type === "bar" || type === "line" || type === "area";
}

function encodingTypeForField(field: string): ColorEncoding["type"] {
  return /severity|status|alarm/i.test(field) ? "semantic" : "semantic";
}

export function inferColorEncodingForPanel(args: {
  type: PanelSpec["type"];
  metric: MetricProfile;
  intent?: string;
  profileFields?: string[];
}): ColorEncoding | undefined {
  if (!isCartesianPanelType(args.type)) return undefined;

  const explicitField = args.metric.tags?.colorField;
  if (explicitField) {
    return { field: explicitField, type: encodingTypeForField(explicitField) };
  }

  const fields = args.profileFields ?? [];
  const matched = findProfileColorField(fields);
  if (!matched) return undefined;

  const intentMatch = intentWantsColorEncoding(args.intent);
  const profileMatch =
    metricSuggestsConditionalColor(args.metric) || args.type === "bar";

  if (intentMatch || profileMatch) {
    return { field: matched, type: encodingTypeForField(matched) };
  }

  return undefined;
}
