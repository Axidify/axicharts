export type DataProfileLike = {
  fields?: string[];
  metrics?: Array<{ name: string; kind?: string }>;
};

export type SpecDataLike = Record<string, unknown>[];

export type DescribedField = {
  field: string;
  role: "time" | "category" | "numeric" | "unknown";
  sampleValues?: unknown[];
};

export type DescribeDataProfileResult = {
  fields: DescribedField[];
  rowCount: number;
};

const TIME_FIELD_RE =
  /week|month|day|hour|date|time|period|quarter|timestamp|ts/i;

function inferRole(
  field: string,
  rows: SpecDataLike,
): DescribedField["role"] {
  if (TIME_FIELD_RE.test(field)) return "time";
  const samples = rows
    .slice(0, 8)
    .map((row) => row[field])
    .filter((value) => value != null);
  if (samples.length === 0) return "unknown";
  if (samples.every((value) => typeof value === "number" && Number.isFinite(value))) {
    return "numeric";
  }
  if (samples.every((value) => typeof value === "string")) {
    return TIME_FIELD_RE.test(field) ? "time" : "category";
  }
  return "unknown";
}

function fieldNames(input: {
  dataProfile?: DataProfileLike;
  rows?: SpecDataLike;
}): string[] {
  if (input.dataProfile?.fields?.length) {
    return input.dataProfile.fields;
  }
  if (input.dataProfile?.metrics?.length) {
    return input.dataProfile.metrics.map((metric) => metric.name);
  }
  if (input.rows?.length && input.rows[0]) {
    return Object.keys(input.rows[0]);
  }
  return [];
}

/** Infer field roles from a data profile or sample rows (C140 MCP tool). */
export function describeDataProfile(input: {
  dataProfile?: DataProfileLike;
  rows?: SpecDataLike;
}): DescribeDataProfileResult {
  const rows = input.rows ?? [];
  const names = fieldNames(input);
  return {
    rowCount: rows.length,
    fields: names.map((field) => ({
      field,
      role: inferRole(field, rows),
      sampleValues: rows.slice(0, 3).map((row) => row[field]),
    })),
  };
}
