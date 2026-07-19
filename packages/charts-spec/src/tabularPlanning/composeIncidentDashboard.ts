import type { FieldProfile } from "../types";
import type { PanelRecipe } from "./recipes/types";
import { cellNumber, findNamedField } from "./enrich/types";

const CLOSED_STATUS = /closed|resolved|done/i;
const PRIORITY_ORDER = ["Critical", "High", "Medium", "Low"] as const;

export function detectIncidentTable(fieldProfiles: FieldProfile[]): boolean {
  const names = fieldProfiles.map((profile) => profile.name.toLowerCase());
  const hasTicket = names.some((name) => /ticket|incident/.test(name));
  const hasStatus = names.some((name) => /status/.test(name));
  const hasOpsSignal = names.some((name) =>
    /priority|category|assigned|resolution|severity/.test(name),
  );
  return hasTicket && hasStatus && hasOpsSignal;
}

function isClosed(row: Record<string, unknown>, statusField: string): boolean {
  return CLOSED_STATUS.test(String(row[statusField] ?? ""));
}

function closedRowsWithResolution(
  rows: Record<string, unknown>[],
  statusField: string,
  resolutionField: string,
): Record<string, unknown>[] {
  return rows.filter((row) => isClosed(row, statusField) && cellNumber(row, resolutionField) > 0);
}

function avgResolutionHours(
  rows: Record<string, unknown>[],
  statusField: string,
  resolutionField: string,
): number {
  const closed = closedRowsWithResolution(rows, statusField, resolutionField);
  if (closed.length === 0) return 0;
  const total = closed.reduce((sum, row) => sum + cellNumber(row, resolutionField), 0);
  return Math.round((total / closed.length) * 10) / 10;
}

function avgResolutionByPriority(
  rows: Record<string, unknown>[],
  priorityField: string,
  statusField: string,
  resolutionField: string,
): Record<string, unknown>[] {
  const buckets = new Map<string, { sum: number; count: number }>();
  for (const row of closedRowsWithResolution(rows, statusField, resolutionField)) {
    const priority = String(row[priorityField] ?? "Unknown");
    const bucket = buckets.get(priority) ?? { sum: 0, count: 0 };
    bucket.sum += cellNumber(row, resolutionField);
    bucket.count += 1;
    buckets.set(priority, bucket);
  }

  return [...buckets.entries()]
    .map(([priority, bucket]) => ({
      Priority: priority,
      "Avg resolution (hrs)": Math.round((bucket.sum / bucket.count) * 10) / 10,
    }))
    .sort((left, right) => {
      const li = PRIORITY_ORDER.indexOf(left.Priority as (typeof PRIORITY_ORDER)[number]);
      const ri = PRIORITY_ORDER.indexOf(right.Priority as (typeof PRIORITY_ORDER)[number]);
      return (li === -1 ? 99 : li) - (ri === -1 ? 99 : ri);
    });
}

/**
 * Agent-style compose for incident / ticket tables (C178-shaped rules v0).
 */
export function suggestIncidentAnalytics(
  rows: Record<string, unknown>[],
  fieldProfiles: FieldProfile[],
): PanelRecipe[] {
  const statusField = findNamedField(fieldProfiles, /status/i);
  const priorityField = findNamedField(fieldProfiles, /priority/i);
  const assigneeField = findNamedField(fieldProfiles, /assigned|assignee|owner/i);
  const resolutionField = findNamedField(fieldProfiles, /resolution.*time|time.*hrs|duration/i);
  const categoryField = findNamedField(fieldProfiles, /category/i);

  if (!statusField) return [];

  const openCount = rows.filter((row) => !isClosed(row, statusField)).length;
  const closedCount = rows.filter((row) => isClosed(row, statusField)).length;
  const avgResolution = resolutionField
    ? avgResolutionHours(rows, statusField, resolutionField)
    : 0;
  const escalatedCount = priorityField
    ? rows.filter((row) => /critical|high/i.test(String(row[priorityField] ?? ""))).length
    : 0;

  const recipes: PanelRecipe[] = [
    {
      questionId: "agent.incident.kpi.open",
      title: "Open tickets",
      intent: "open incident count",
      panelType: "stat",
      vertical: "ops",
      kpiValue: openCount,
      kpiLabel: "Open tickets",
    },
    {
      questionId: "agent.incident.kpi.closed",
      title: "Closed tickets",
      intent: "closed incident count",
      panelType: "stat",
      vertical: "ops",
      kpiValue: closedCount,
      kpiLabel: "Closed tickets",
    },
  ];

  if (resolutionField && closedCount > 0) {
    recipes.push({
      questionId: "agent.incident.kpi.avg_resolution",
      title: "Avg resolution (hrs)",
      intent: "mean resolution time for closed tickets",
      panelType: "stat",
      vertical: "ops",
      kpiValue: avgResolution,
      kpiLabel: "Avg resolution (hrs)",
    });
  }

  if (priorityField && escalatedCount > 0) {
    recipes.push({
      questionId: "agent.incident.kpi.escalated",
      title: "Critical / High",
      intent: "priority escalation count",
      panelType: "stat",
      vertical: "ops",
      kpiValue: escalatedCount,
      kpiLabel: "Critical / High",
    });
  }

  recipes.push({
    questionId: "agent.incident.chart.status",
    title: "Tickets by status",
    intent: "status breakdown bar chart",
    panelType: "cartesian",
    markType: "bar",
    vertical: "ops",
    groupBy: statusField,
    xField: statusField,
    yField: "count",
    aggregates: { count: { op: "count" } },
  });

  if (priorityField && resolutionField) {
    const byPriority = avgResolutionByPriority(rows, priorityField, statusField, resolutionField);
    if (byPriority.length > 0) {
      recipes.push({
        questionId: "agent.incident.chart.resolution_by_priority",
        title: "Avg resolution by priority",
        intent: "closed-ticket resolution time by priority",
        panelType: "cartesian",
        markType: "bar",
        vertical: "ops",
        preparedRows: byPriority,
        xField: "Priority",
        yField: "Avg resolution (hrs)",
      });
    }
  }

  if (assigneeField) {
    recipes.push({
      questionId: "agent.incident.chart.by_assignee",
      title: "Tickets by assignee",
      intent: "workload by assignee",
      panelType: "cartesian",
      markType: "bar",
      vertical: "ops",
      groupBy: assigneeField,
      xField: assigneeField,
      yField: "count",
      aggregates: { count: { op: "count" } },
    });
  } else if (categoryField) {
    recipes.push({
      questionId: "agent.incident.chart.by_category",
      title: "Tickets by category",
      intent: "category breakdown",
      panelType: "cartesian",
      markType: "bar",
      vertical: "ops",
      groupBy: categoryField,
      xField: categoryField,
      yField: "count",
      aggregates: { count: { op: "count" } },
    });
  }

  recipes.push({
    questionId: "agent.incident.table.tickets",
    title: "Incident tickets",
    intent: "full ticket register",
    panelType: "table",
    vertical: "ops",
    preparedRows: rows,
    tableColumns: fieldProfiles.map((profile) => ({
      key: profile.name,
      label: profile.name,
      align: profile.role === "measure" ? "right" : "left",
    })),
  });

  return recipes;
}
