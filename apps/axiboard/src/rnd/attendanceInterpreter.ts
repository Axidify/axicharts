import { createTablePanel, type PanelSpec } from "@axicharts/charts-spec";
import type { AttendanceEnrichment } from "./attendanceEnrich";

export type AttendanceChartAction = {
  kind: "chart";
  step: string;
  intent: string;
  rows: Record<string, string | number>[];
  xField: string;
  yField?: string;
  title: string;
};

export type AttendanceTableAction = {
  kind: "table";
  step: string;
  intent: string;
  panel: PanelSpec;
  rows: Record<string, string | number>[];
};

export type AttendanceFollowUpAction = AttendanceChartAction | AttendanceTableAction;

function matches(intent: string, pattern: RegExp): boolean {
  return pattern.test(intent.toLowerCase());
}

/** C153 — attendance rule-pack interpreter for agent follow-ups. */
export function interpretAttendanceFollowUp(
  intent: string,
  enriched: AttendanceEnrichment,
): AttendanceFollowUpAction[] {
  const actions: AttendanceFollowUpAction[] = [];
  const { fields } = enriched;

  if (matches(intent, /hours?\s*by\s*department|department\s*hours/)) {
    const presentOnly = /present/.test(intent);
    actions.push({
      kind: "chart",
      step: "Chart — hours by department (follow-up)",
      intent: "hours bar chart by department with value labels",
      rows: presentOnly ? enriched.hoursByDepartmentPresent : enriched.hoursByDepartment,
      xField: fields.department,
      yField: "hours",
      title: presentOnly ? "Hours by department (present)" : "Hours by department",
    });
  }

  if (matches(intent, /status|leave|present|breakdown/)) {
    actions.push({
      kind: "chart",
      step: "Chart — status breakdown (follow-up)",
      intent: "status breakdown bar chart with value labels",
      rows: enriched.countByStatus,
      xField: fields.status,
      yField: "count",
      title: "Headcount by status",
    });
  }

  if (matches(intent, /attendance\s*table|show\s*employees|timesheet|all\s*rows/)) {
    actions.push({
      kind: "table",
      step: "Table — attendance log (follow-up)",
      intent,
      panel: createTablePanel({
        title: "Attendance log",
        columns: [
          { key: fields.name, label: "Employee" },
          { key: fields.department, label: "Department" },
          { key: fields.clockIn, label: "Clock in" },
          { key: fields.clockOut, label: "Clock out" },
          { key: fields.hours, label: "Hours", align: "right" },
          { key: fields.status, label: "Status" },
        ],
      }),
      rows: enriched.rows,
    });
  }

  return actions;
}
