import {
  aggregateRows,
  inferFieldRoles,
  type FieldProfile,
} from "@axicharts/charts-spec";
import type { TabularRow } from "./parseTabular";

export type AttendanceKpis = {
  totalHours: number;
  presentCount: number;
  leaveCount: number;
  headcount: number;
  avgHoursPresent: number;
};

export type AttendanceEnrichment = {
  rows: TabularRow[];
  fieldProfiles: FieldProfile[];
  fields: {
    employeeId: string;
    name: string;
    department: string;
    date: string;
    clockIn: string;
    clockOut: string;
    hours: string;
    status: string;
  };
  kpis: AttendanceKpis;
  hoursByDepartment: Record<string, string | number>[];
  hoursByDepartmentPresent: Record<string, string | number>[];
  countByStatus: Record<string, string | number>[];
};

function findNamedField(fieldProfiles: FieldProfile[], pattern: RegExp): string {
  return fieldProfiles.find((profile) => pattern.test(profile.name))?.name ?? "";
}

function cellNumber(row: TabularRow, field: string): number {
  const value = row[field];
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value !== "" && value !== "-") {
    const num = Number(value.replace(/,/g, ""));
    return Number.isFinite(num) ? num : 0;
  }
  return 0;
}

/** C153 — attendance analyzer using inferFieldRoles + aggregateRows. */
export function enrichAttendance(rows: TabularRow[]): AttendanceEnrichment | null {
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
    rows,
    fieldProfiles,
    fields: fieldMap,
    kpis: {
      totalHours,
      presentCount,
      leaveCount,
      headcount: rows.length,
      avgHoursPresent: presentCount > 0 ? hoursPresentSum / presentCount : 0,
    },
    hoursByDepartment,
    hoursByDepartmentPresent,
    countByStatus,
  };
}

export function formatHours(value: number): string {
  return value.toLocaleString("en-MY", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}
