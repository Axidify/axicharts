import type { MetricProfile, PanelSpec, SizeEncoding } from "./types";
import {
  intentWantsVerticalSize,
  resolveVerticalId,
  sizeFieldPriorityForVertical,
} from "./rulePacks";

const SIZE_FIELD_PRIORITY = [
  "volume",
  "weight",
  "magnitude",
  "count",
  "samples",
  "size",
  "requests",
  "connections",
  "load",
  "inventory",
  "population",
  "throughput",
] as const;

function normalizeFieldName(field: string): string {
  return field.toLowerCase().replace(/_/g, "");
}

export function findProfileSizeField(
  fields: string[],
  excludeField?: string,
  extraPriority: readonly string[] = [],
): string | undefined {
  const exclude = excludeField
    ? normalizeFieldName(excludeField)
    : undefined;
  const byNormalized = new Map(
    fields.map((field) => [normalizeFieldName(field), field]),
  );

  const priority = [...extraPriority, ...SIZE_FIELD_PRIORITY];
  const seen = new Set<string>();

  for (const candidate of priority) {
    const normalized = normalizeFieldName(candidate);
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    if (exclude && normalized === exclude) continue;
    const match = byNormalized.get(normalized);
    if (match) return match;
  }

  return undefined;
}

export function intentWantsSizeEncoding(intent?: string): boolean {
  if (!intent) return false;
  return /size\s*by|sized?\s*by|variable\s*(bar\s*)?width|dot\s*size|radius\s*by|bubble|proportional\s*to|width\s*by|scale\s*by\s*(volume|weight|count)|bar\s*width\s*by/i.test(
    intent,
  );
}

function metricSuggestsSizeEncoding(metric: MetricProfile): boolean {
  const name = metric.name.toLowerCase();
  return /volume|count|weight|samples|requests|load|inventory|population/.test(
    name,
  );
}

function isCartesianPanelType(type: PanelSpec["type"]): boolean {
  return type === "bar" || type === "line" || type === "area";
}

export function inferSizeEncodingForPanel(args: {
  type: PanelSpec["type"];
  metric: MetricProfile;
  intent?: string;
  profileFields?: string[];
}): SizeEncoding | undefined {
  if (!isCartesianPanelType(args.type)) return undefined;

  const explicitField = args.metric.tags?.sizeField;
  if (explicitField) {
    return { field: explicitField, type: "quantitative" };
  }

  const vertical = resolveVerticalId({
    metric: args.metric,
    intent: args.intent,
    profileFields: args.profileFields,
  });
  const fields = args.profileFields ?? [];
  const matched = findProfileSizeField(
    fields,
    args.metric.name,
    sizeFieldPriorityForVertical(vertical),
  );
  if (!matched) return undefined;

  const intentMatch =
    intentWantsSizeEncoding(args.intent) ||
    intentWantsVerticalSize(args.intent, vertical);
  const profileMatch =
    args.type === "bar" && metricSuggestsSizeEncoding(args.metric);

  if (!intentMatch && !profileMatch) return undefined;

  return { field: matched, type: "quantitative" };
}
