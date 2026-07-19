import {
  aggregateRows,
  fieldProfilesToDataProfile,
  inferFieldRoles,
  type FieldProfile,
} from "@axicharts/charts-spec";
import type { TabularRow } from "./parseTabular";
import { parseAmount } from "./parseTabular";

export type LedgerKpis = {
  balance: number;
  totalCredits: number;
  totalDebits: number;
  netFlow: number;
  transactionCount: number;
};

export type LedgerEnrichment = {
  rows: TabularRow[];
  fieldProfiles: FieldProfile[];
  fields: {
    date: string;
    debit: string;
    credit: string;
    balance: string;
    category: string;
    costCenter: string;
    paymentMethod: string;
  };
  kpis: LedgerKpis;
  byDate: Record<string, string | number>[];
  expensesByCategory: Record<string, string | number>[];
  revenueByCategory: Record<string, string | number>[];
  spendByCostCenter: Record<string, string | number>[];
  volumeByPaymentMethod: Record<string, string | number>[];
};

function findNamedField(fieldProfiles: FieldProfile[], pattern: RegExp): string {
  return fieldProfiles.find((profile) => pattern.test(profile.name))?.name ?? "";
}

function cellAmount(row: TabularRow, field: string): number {
  const value = row[field];
  if (typeof value === "number") return value;
  return parseAmount(String(value ?? "0"));
}

/** R&D ledger analyzer — uses axicharts inferFieldRoles + aggregateRows (C148). */
export function enrichLedger(rows: TabularRow[]): LedgerEnrichment | null {
  if (rows.length === 0) return null;

  const fieldProfiles = inferFieldRoles(rows);
  const { fields: profileFields } = fieldProfilesToDataProfile(fieldProfiles);

  const fieldMap = {
    date: findNamedField(fieldProfiles, /date/i),
    debit: findNamedField(fieldProfiles, /debit/i),
    credit: findNamedField(fieldProfiles, /credit/i),
    balance: findNamedField(fieldProfiles, /balance/i),
    category: findNamedField(fieldProfiles, /category/i),
    costCenter: findNamedField(fieldProfiles, /cost\s*center/i),
    paymentMethod: findNamedField(fieldProfiles, /payment\s*method/i),
  };

  let totalDebits = 0;
  let totalCredits = 0;
  for (const row of rows) {
    totalDebits += cellAmount(row, fieldMap.debit);
    totalCredits += cellAmount(row, fieldMap.credit);
  }

  const lastBalance = cellAmount(rows[rows.length - 1], fieldMap.balance);

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
      aggregates: {
        spend: { op: "sum", field: fieldMap.debit },
      },
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

  return {
    rows,
    fieldProfiles,
    fields: fieldMap,
    kpis: {
      balance: lastBalance,
      totalCredits,
      totalDebits,
      netFlow: totalCredits - totalDebits,
      transactionCount: rows.length,
    },
    byDate,
    expensesByCategory,
    revenueByCategory,
    spendByCostCenter,
    volumeByPaymentMethod,
  };
}

export function formatRm(value: number): string {
  const sign = value < 0 ? "-" : "";
  return `${sign}RM ${Math.abs(value).toLocaleString("en-MY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
