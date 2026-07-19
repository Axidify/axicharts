import { aggregateRows } from "../../aggregateRows";
import { inferFieldRoles } from "../../inferFieldRoles";
import type { DomainSemantics } from "../../classifyTabularDomain";
import type { VerticalId } from "../../rulePacks/types";
import { cellNumber, findNamedField, parseAmount, type TabularEnrichment } from "./types";

export type { TabularEnrichment } from "./types";

const STAGE_ORDER = [
  "Discovery",
  "Qualified",
  "Proposal",
  "Negotiation",
  "Closed Won",
  "Closed Lost",
];

function sortByStage(rows: Record<string, unknown>[], stageField: string): void {
  rows.sort((a, b) => {
    const left = STAGE_ORDER.indexOf(String(a[stageField]));
    const right = STAGE_ORDER.indexOf(String(b[stageField]));
    return (left === -1 ? 99 : left) - (right === -1 ? 99 : right);
  });
}

export function enrichSales(rows: Record<string, unknown>[]): TabularEnrichment | null {
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

  const derivedRows: Record<string, unknown>[] = rows.map((row) => {
    const value = cellNumber(row, fieldMap.value);
    const probability = cellNumber(row, fieldMap.probability);
    return { ...row, weightedValue: (value * probability) / 100 };
  });

  let totalPipeline = 0;
  let weightedForecast = 0;
  let wonValue = 0;
  let openOpportunities = 0;

  for (const row of derivedRows) {
    const value = cellNumber(row, fieldMap.value);
    totalPipeline += value;
    weightedForecast += cellNumber(row, "weightedValue");
    const stage = String(row[fieldMap.stage] ?? "");
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
    vertical: "sales",
    rows,
    derivedRows,
    fieldProfiles,
    fieldMap,
    kpis: {
      totalPipeline,
      weightedForecast,
      wonValue,
      openOpportunities,
      opportunityCount: rows.length,
    },
    datasets: {
      valueByStage,
      openPipelineByStage,
      valueBySalesperson,
      weightedBySalesperson,
      valueBySource,
    },
  };
}

export function enrichLedger(rows: Record<string, unknown>[]): TabularEnrichment | null {
  if (rows.length === 0) return null;

  const fieldProfiles = inferFieldRoles(rows);
  const fieldMap = {
    date: findNamedField(fieldProfiles, /date/i),
    debit: findNamedField(fieldProfiles, /debit/i),
    credit: findNamedField(fieldProfiles, /credit/i),
    balance: findNamedField(fieldProfiles, /balance/i),
    category: findNamedField(fieldProfiles, /category/i),
    costCenter: findNamedField(fieldProfiles, /cost\s*center/i),
    paymentMethod: findNamedField(fieldProfiles, /payment\s*method/i),
  };

  function cellAmount(row: Record<string, unknown>, field: string): number {
    const value = row[field];
    if (typeof value === "number") return value;
    return parseAmount(String(value ?? "0"));
  }

  let totalDebits = 0;
  let totalCredits = 0;
  for (const row of rows) {
    totalDebits += cellAmount(row, fieldMap.debit);
    totalCredits += cellAmount(row, fieldMap.credit);
  }

  const byDate = aggregateRows(rows, {
    groupBy: fieldMap.date,
    aggregates: {
      balance: { op: "last", field: fieldMap.balance },
      debit: { op: "sum", field: fieldMap.debit },
      credit: { op: "sum", field: fieldMap.credit },
    },
  }).sort((a, b) => String(a[fieldMap.date]).localeCompare(String(b[fieldMap.date])));

  const byCategory = aggregateRows(rows, {
    groupBy: fieldMap.category,
    aggregates: {
      debit: { op: "sum", field: fieldMap.debit },
      credit: { op: "sum", field: fieldMap.credit },
    },
  });

  const expensesByCategory = byCategory
    .filter((row) => Number(row.debit) > 0)
    .sort((a, b) => Number(b.debit) - Number(a.debit));

  const revenueByCategory = byCategory
    .filter((row) => Number(row.credit) > 0)
    .sort((a, b) => Number(b.credit) - Number(a.credit));

  const spendByCostCenter = aggregateRows(
    rows.filter((row) => cellAmount(row, fieldMap.debit) > 0),
    {
      groupBy: fieldMap.costCenter,
      aggregates: { spend: { op: "sum", field: fieldMap.debit } },
    },
  ).sort((a, b) => Number(b.spend) - Number(a.spend));

  const volumeByPaymentMethod = aggregateRows(rows, {
    groupBy: fieldMap.paymentMethod,
    aggregates: {
      volume: { op: "sum", fields: [fieldMap.debit, fieldMap.credit] },
      debit: { op: "sum", field: fieldMap.debit },
      credit: { op: "sum", field: fieldMap.credit },
    },
  }).sort((a, b) => Number(b.volume) - Number(a.volume));

  const waterfallByCategory = [
    { name: "Credits", value: totalCredits, tone: "success" },
    ...byCategory
      .filter((row) => Number(row.debit) > 0)
      .map((row) => ({
        name: String(row[fieldMap.category]),
        value: -Number(row.debit),
        tone: "warning",
      })),
    { name: "Net flow", value: totalCredits - totalDebits, isTotal: true },
  ];

  return {
    vertical: "ledger",
    rows,
    derivedRows: rows,
    fieldProfiles,
    fieldMap,
    kpis: {
      balance: cellAmount(rows[rows.length - 1]!, fieldMap.balance),
      totalCredits,
      totalDebits,
      netFlow: totalCredits - totalDebits,
      transactionCount: rows.length,
    },
    datasets: {
      byDate,
      expensesByCategory,
      revenueByCategory,
      spendByCostCenter,
      volumeByPaymentMethod,
    },
    extras: { waterfallByCategory },
  };
}

export function enrichAttendance(rows: Record<string, unknown>[]): TabularEnrichment | null {
  if (rows.length === 0) return null;

  const fieldProfiles = inferFieldRoles(rows);
  const fieldMap = {
    employeeId: findNamedField(fieldProfiles, /employee\s*id|emp\s*id/i),
    name: findNamedField(fieldProfiles, /^name$/i),
    department: findNamedField(fieldProfiles, /department|team/i),
    date: findNamedField(fieldProfiles, /date/i),
    clockIn: findNamedField(fieldProfiles, /clock\s*in/i),
    clockOut: findNamedField(fieldProfiles, /clock\s*out/i),
    hours: findNamedField(fieldProfiles, /^hours$/i),
    status: findNamedField(fieldProfiles, /status/i),
  };

  let totalHours = 0;
  let presentCount = 0;
  let leaveCount = 0;
  let hoursPresentSum = 0;

  for (const row of rows) {
    const hours = cellNumber(row, fieldMap.hours);
    totalHours += hours;
    const status = String(row[fieldMap.status] ?? "");
    if (/present/i.test(status)) {
      presentCount += 1;
      hoursPresentSum += hours;
    }
    if (/leave|absent/i.test(status)) leaveCount += 1;
  }

  const hoursByDepartment = aggregateRows(rows, {
    groupBy: fieldMap.department,
    aggregates: { hours: { op: "sum", field: fieldMap.hours } },
  }).sort((a, b) => Number(b.hours) - Number(a.hours));

  const hoursByDepartmentPresent = aggregateRows(rows, {
    groupBy: fieldMap.department,
    where: [{ field: fieldMap.status, op: "eq", value: "Present" }],
    aggregates: { hours: { op: "sum", field: fieldMap.hours } },
  }).sort((a, b) => Number(b.hours) - Number(a.hours));

  const countByStatus = aggregateRows(rows, {
    groupBy: fieldMap.status,
    aggregates: { count: { op: "count" } },
  }).sort((a, b) => Number(b.count) - Number(a.count));

  return {
    vertical: "attendance",
    rows,
    derivedRows: rows,
    fieldProfiles,
    fieldMap,
    kpis: {
      totalHours,
      presentCount,
      leaveCount,
      headcount: rows.length,
      avgHoursPresent: presentCount > 0 ? hoursPresentSum / presentCount : 0,
    },
    datasets: {
      hoursByDepartment,
      hoursByDepartmentPresent,
      countByStatus,
    },
  };
}

export function enrichTabular(
  rows: Record<string, unknown>[],
  domain: DomainSemantics,
): TabularEnrichment | null {
  if (domain.vertical === "sales") return enrichSales(rows);
  if (domain.vertical === "ledger") return enrichLedger(rows);
  if (domain.vertical === "attendance") return enrichAttendance(rows);
  return null;
}
