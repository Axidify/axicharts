import type { ColorEncoding, MetricProfile, PanelSpec } from "./types";
import {
  colorFieldPriorityForVertical,
  intentWantsVerticalColor,
  resolveVerticalId,
} from "./rulePacks";

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

export function findProfileColorField(
  fields: string[],
  extraPriority: readonly string[] = [],
): string | undefined {
  const byNormalized = new Map(
    fields.map((field) => [normalizeFieldName(field), field]),
  );

  const priority = [...extraPriority, ...COLOR_FIELD_PRIORITY];
  const seen = new Set<string>();

  for (const candidate of priority) {
    const normalized = normalizeFieldName(candidate);
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    const match = byNormalized.get(normalized);
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
  return type === "bar" || type === "line" || type === "area" || type === "cartesian";
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

  const vertical = resolveVerticalId({
    metric: args.metric,
    intent: args.intent,
    profileFields: args.profileFields,
  });
  const fields = args.profileFields ?? [];
  const matched = findProfileColorField(
    fields,
    colorFieldPriorityForVertical(vertical),
  );
  if (!matched) return undefined;

  const intentMatch =
    intentWantsColorEncoding(args.intent) ||
    intentWantsVerticalColor(args.intent, vertical);
  const profileMatch =
    metricSuggestsConditionalColor(args.metric) ||
    args.type === "bar" ||
    (args.type === "cartesian" &&
      args.metric.name.toLowerCase().includes("volume"));

  if (intentMatch || profileMatch) {
    return { field: matched, type: encodingTypeForField(matched) };
  }

  return undefined;
}
