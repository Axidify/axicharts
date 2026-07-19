import {
  classifyTabularDomain,
  fieldProfilesToDataProfile,
  inferFieldRoles,
  type DomainSemantics,
  type FieldProfile,
  type FieldRole,
} from "@axicharts/charts-spec";

export type DataProfileLike = {
  fields?: string[];
  metrics?: Array<{ name: string; kind?: string }>;
  fieldProfiles?: FieldProfile[];
};

export type SpecDataLike = Record<string, unknown>[];

export type DescribedField = {
  field: string;
  role: "time" | "category" | "numeric" | "identifier" | "unknown";
  semanticRole?: FieldRole;
  format?: "currency" | "number" | "percent" | "compact";
  sampleValues?: unknown[];
};

export type DescribeDataProfileResult = {
  fields: DescribedField[];
  fieldProfiles?: FieldProfile[];
  rowCount: number;
  domain?: DomainSemantics;
};

function mapRole(role: FieldRole): DescribedField["role"] {
  switch (role) {
    case "time":
      return "time";
    case "measure":
      return "numeric";
    case "dimension":
      return "category";
    case "identifier":
      return "identifier";
    default:
      return "unknown";
  }
}

function inferFormat(field: string, role: FieldRole): DescribedField["format"] | undefined {
  if (role !== "measure") return undefined;
  if (/rm|usd|eur|currency|debit|credit|balance|amount|revenue|spend|price|cost/i.test(field)) {
    return "currency";
  }
  if (/%|percent|margin|rate/i.test(field)) return "percent";
  return "number";
}

function fieldNames(input: {
  dataProfile?: DataProfileLike;
  rows?: SpecDataLike;
}): string[] {
  if (input.dataProfile?.fieldProfiles?.length) {
    return input.dataProfile.fieldProfiles.map((profile) => profile.name);
  }
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

/** Infer field roles from a data profile or sample rows (C140 / C148 MCP tool). */
export function describeDataProfile(input: {
  dataProfile?: DataProfileLike;
  rows?: SpecDataLike;
}): DescribeDataProfileResult {
  const rows = input.rows ?? [];
  const providedProfiles = input.dataProfile?.fieldProfiles;
  const names = fieldNames(input);
  const fieldProfiles =
    providedProfiles && providedProfiles.length > 0
      ? providedProfiles
      : rows.length > 0
        ? inferFieldRoles(rows)
        : names.map((name) => ({
            name,
            role: inferFieldRoles([{ [name]: 0 }], { hints: {} })[0]?.role ?? "dimension",
          }));

  return {
    rowCount: rows.length,
    fieldProfiles,
    domain: classifyTabularDomain({ fieldProfiles }),
    fields: fieldProfiles.map((profile) => ({
      field: profile.name,
      role: mapRole(profile.role),
      semanticRole: profile.role,
      format: inferFormat(profile.name, profile.role),
      sampleValues: rows.slice(0, 3).map((row) => row[profile.name]),
    })),
  };
}

export function rowsToDataProfile(rows: SpecDataLike): DataProfileLike {
  const fieldProfiles = inferFieldRoles(rows);
  return fieldProfilesToDataProfile(fieldProfiles);
}
