import type { MetricProfile, PanelSpec, SizeEncoding } from "./types";

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
): string | undefined {
  const exclude = excludeField
    ? normalizeFieldName(excludeField)
    : undefined;
  const byNormalized = new Map(
    fields.map((field) => [normalizeFieldName(field), field]),
  );

  for (const candidate of SIZE_FIELD_PRIORITY) {
    const normalized = normalizeFieldName(candidate);
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

  const fields = args.profileFields ?? [];
  const matched = findProfileSizeField(fields, args.metric.name);
  if (!matched) return undefined;

  const intentMatch = intentWantsSizeEncoding(args.intent);
  const profileMatch =
    args.type === "bar" && metricSuggestsSizeEncoding(args.metric);

  if (!intentMatch && !profileMatch) return undefined;

  return { field: matched, type: "quantitative" };
}
