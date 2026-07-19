import { aggregateRows, inferFieldRoles, type FieldProfile } from "@axicharts/charts-spec";
import type { TabularRow } from "./parseTabular";

export type PipelineKpis = {
  totalPipeline: number;
  weightedForecast: number;
  wonValue: number;
  openOpportunities: number;
  opportunityCount: number;
};

export type PipelineEnrichment = {
  rows: TabularRow[];
  derivedRows: TabularRow[];
  fieldProfiles: FieldProfile[];
  fields: {
    opportunityId: string;
    customer: string;
    salesperson: string;
    stage: string;
    value: string;
    probability: string;
    expectedClose: string;
    source: string;
  };
  kpis: PipelineKpis;
  valueByStage: Record<string, string | number>[];
  valueBySalesperson: Record<string, string | number>[];
  weightedBySalesperson: Record<string, string | number>[];
  valueBySource: Record<string, string | number>[];
  openPipelineByStage: Record<string, string | number>[];
};

const STAGE_ORDER = [
  "Discovery",
  "Qualified",
  "Proposal",
  "Negotiation",
  "Closed Won",
  "Closed Lost",
];

function findNamedField(fieldProfiles: FieldProfile[], pattern: RegExp): string {
  return fieldProfiles.find((profile) => pattern.test(profile.name))?.name ?? "";
}

function cellNumber(row: TabularRow, field: string): number {
  const value = row[field];
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value !== "" && value !== "-") {
    const num = Number(value.replace(/,/g, "").replace(/%/g, ""));
    return Number.isFinite(num) ? num : 0;
  }
  return 0;
}

function sortByStage(rows: Record<string, string | number>[], stageField: string): void {
  rows.sort((a, b) => {
    const left = STAGE_ORDER.indexOf(String(a[stageField]));
    const right = STAGE_ORDER.indexOf(String(b[stageField]));
    return (left === -1 ? 99 : left) - (right === -1 ? 99 : right);
  });
}

/** C154 — CRM pipeline analyzer. */
export function enrichPipeline(rows: TabularRow[]): PipelineEnrichment | null {
  if (rows.length === 0) return null;

  const fieldProfiles = inferFieldRoles(rows);
  const fieldMap = {
    opportunityId: findNamedField(fieldProfiles, /opportunity\s*id|deal\s*id/i),
    customer: findNamedField(fieldProfiles, /customer|account|company/i),
    salesperson: findNamedField(fieldProfiles, /salesperson|sales\s*rep|owner/i),
    stage: findNamedField(fieldProfiles, /stage|phase/i),
    value: findNamedField(fieldProfiles, /value|amount|revenue/i),
    probability: findNamedField(fieldProfiles, /probability|likelihood/i),
    expectedClose: findNamedField(fieldProfiles, /expected\s*close|close\s*date/i),
    source: findNamedField(fieldProfiles, /source|channel|lead\s*source/i),
  };

  const derivedRows: TabularRow[] = rows.map((row) => {
    const value = cellNumber(row, fieldMap.value);
    const probability = cellNumber(row, fieldMap.probability);
    return {
      ...row,
      weightedValue: (value * probability) / 100,
    };
  });

  let totalPipeline = 0;
  let weightedForecast = 0;
  let wonValue = 0;
  let openOpportunities = 0;

  for (const row of derivedRows) {
    const value = cellNumber(row, fieldMap.value);
    const weighted = cellNumber(row, "weightedValue");
    const stage = String(row[fieldMap.stage] ?? "");
    totalPipeline += value;
    weightedForecast += weighted;
    if (/closed\s*won/i.test(stage)) wonValue += value;
    else openOpportunities += 1;
  }

  const valueByStage = aggregateRows(derivedRows, {
    groupBy: fieldMap.stage,
    aggregates: { value: { op: "sum", field: fieldMap.value } },
  });
  sortByStage(valueByStage, fieldMap.stage);

  const valueBySalesperson = aggregateRows(derivedRows, {
    groupBy: fieldMap.salesperson,
    aggregates: { value: { op: "sum", field: fieldMap.value } },
  }).sort((a, b) => Number(b.value) - Number(a.value));

  const weightedBySalesperson = aggregateRows(derivedRows, {
    groupBy: fieldMap.salesperson,
    aggregates: { weightedValue: { op: "sum", field: "weightedValue" } },
  }).sort((a, b) => Number(b.weightedValue) - Number(a.weightedValue));

  const valueBySource = aggregateRows(derivedRows, {
    groupBy: fieldMap.source,
    aggregates: { value: { op: "sum", field: fieldMap.value } },
  }).sort((a, b) => Number(b.value) - Number(a.value));

  const openPipelineByStage = aggregateRows(derivedRows, {
    groupBy: fieldMap.stage,
    where: [{ field: fieldMap.stage, op: "neq", value: "Closed Won" }],
    aggregates: { value: { op: "sum", field: fieldMap.value } },
  });
  sortByStage(openPipelineByStage, fieldMap.stage);

  return {
    rows,
    derivedRows,
    fieldProfiles,
    fields: fieldMap,
    kpis: {
      totalPipeline,
      weightedForecast,
      wonValue,
      openOpportunities,
      opportunityCount: rows.length,
    },
    valueByStage,
    valueBySalesperson,
    weightedBySalesperson,
    valueBySource,
    openPipelineByStage,
  };
}

export function formatRm(value: number): string {
  const sign = value < 0 ? "-" : "";
  return `${sign}RM ${Math.abs(value).toLocaleString("en-MY", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}
