import type { FieldProfile } from "../types";
import type { PanelRecipe } from "./recipes/types";
import { cellNumber, findNamedField } from "./enrich/types";

const CLOSED_STATUS = /closed|resolved/i;
const OPEN_STATUS = /open|in progress|pending|escalat/i;
const SEVERITY_ORDER = ["Critical", "High", "Medium", "Low"] as const;

export function detectSupportCaseTable(fieldProfiles: FieldProfile[]): boolean {
  const names = fieldProfiles.map((profile) => profile.name.toLowerCase());
  const hasCase = names.some((name) => /\bcase\b|case\s*id/.test(name));
  const hasCustomer = names.some((name) => /customer|client|account/.test(name));
  const hasStatus = names.some((name) => /status/.test(name));
  const hasSupportSignal = names.some((name) =>
    /severity|issue\s*type|product|satisfaction|rating/.test(name),
  );
  const hasTicket = names.some((name) => /ticket|incident/.test(name));
  const hasProjectTask =
    names.some((name) => name === "task" || /task name/.test(name)) &&
    names.some((name) => /project/.test(name));
  return hasCase && hasCustomer && hasStatus && hasSupportSignal && !hasTicket && !hasProjectTask;
}

function isClosed(row: Record<string, unknown>, statusField: string): boolean {
  return CLOSED_STATUS.test(String(row[statusField] ?? ""));
}

function isOpen(row: Record<string, unknown>, statusField: string): boolean {
  const status = String(row[statusField] ?? "");
  return OPEN_STATUS.test(status) || (!isClosed(row, statusField) && status.trim() !== "");
}

function satisfactionScore(row: Record<string, unknown>, field: string): number | null {
  const raw = row[field];
  if (raw == null || raw === "" || raw === "-") return null;
  const value = cellNumber(row, field);
  return value > 0 ? value : null;
}

function avgSatisfaction(rows: Record<string, unknown>[], field: string): number {
  const scores = rows
    .map((row) => satisfactionScore(row, field))
    .filter((value): value is number => value != null);
  if (scores.length === 0) return 0;
  const total = scores.reduce((sum, value) => sum + value, 0);
  return Math.round((total / scores.length) * 10) / 10;
}

function avgSatisfactionBySeverity(
  rows: Record<string, unknown>[],
  severityField: string,
  satisfactionField: string,
): Record<string, unknown>[] {
  const buckets = new Map<string, { sum: number; count: number }>();
  for (const row of rows) {
    const score = satisfactionScore(row, satisfactionField);
    if (score == null) continue;
    const severity = String(row[severityField] ?? "Unknown");
    const bucket = buckets.get(severity) ?? { sum: 0, count: 0 };
    bucket.sum += score;
    bucket.count += 1;
    buckets.set(severity, bucket);
  }

  return [...buckets.entries()]
    .map(([severity, bucket]) => ({
      Severity: severity,
      "Avg satisfaction": Math.round((bucket.sum / bucket.count) * 10) / 10,
    }))
    .sort((left, right) => {
      const li = SEVERITY_ORDER.indexOf(left.Severity as (typeof SEVERITY_ORDER)[number]);
      const ri = SEVERITY_ORDER.indexOf(right.Severity as (typeof SEVERITY_ORDER)[number]);
      return (li === -1 ? 99 : li) - (ri === -1 ? 99 : ri);
    });
}

/**
 * Agent-style compose for customer support / case tables.
 */
export function suggestSupportCaseAnalytics(
  rows: Record<string, unknown>[],
  fieldProfiles: FieldProfile[],
): PanelRecipe[] {
  const statusField = findNamedField(fieldProfiles, /status/i);
  const severityField = findNamedField(fieldProfiles, /severity/i);
  const issueTypeField = findNamedField(fieldProfiles, /issue\s*type|category|type/i);
  const productField = findNamedField(fieldProfiles, /product/i);
  const satisfactionField = findNamedField(fieldProfiles, /satisfaction|rating|csat|nps/i);

  if (!statusField) return [];

  const openCount = rows.filter((row) => isOpen(row, statusField) && !isClosed(row, statusField)).length;
  const closedCount = rows.filter((row) => isClosed(row, statusField)).length;
  const escalatedCount = severityField
    ? rows.filter((row) => /critical|high/i.test(String(row[severityField] ?? ""))).length
    : 0;
  const avgCsat = satisfactionField ? avgSatisfaction(rows, satisfactionField) : 0;

  const recipes: PanelRecipe[] = [
    {
      questionId: "agent.support.kpi.open",
      title: "Open cases",
      intent: "open support case count",
      panelType: "stat",
      vertical: "ops",
      kpiValue: openCount,
      kpiLabel: "Open cases",
    },
    {
      questionId: "agent.support.kpi.closed",
      title: "Closed cases",
      intent: "closed support case count",
      panelType: "stat",
      vertical: "ops",
      kpiValue: closedCount,
      kpiLabel: "Closed cases",
    },
  ];

  if (severityField && escalatedCount > 0) {
    recipes.push({
      questionId: "agent.support.kpi.escalated",
      title: "Critical / High",
      intent: "high severity case count",
      panelType: "stat",
      vertical: "ops",
      kpiValue: escalatedCount,
      kpiLabel: "Critical / High",
    });
  }

  if (satisfactionField && avgCsat > 0) {
    recipes.push({
      questionId: "agent.support.kpi.avg_satisfaction",
      title: "Avg satisfaction",
      intent: "mean CSAT for rated cases",
      panelType: "stat",
      vertical: "ops",
      kpiValue: avgCsat,
      kpiLabel: "Avg satisfaction",
    });
  }

  recipes.push({
    questionId: "agent.support.chart.status",
    title: "Cases by status",
    intent: "status breakdown bar chart",
    panelType: "cartesian",
    markType: "bar",
    vertical: "ops",
    groupBy: statusField,
    xField: statusField,
    yField: "count",
    aggregates: { count: { op: "count" } },
  });

  if (severityField) {
    recipes.push({
      questionId: "agent.support.chart.severity",
      title: "Cases by severity",
      intent: "severity breakdown bar chart",
      panelType: "cartesian",
      markType: "bar",
      vertical: "ops",
      groupBy: severityField,
      xField: severityField,
      yField: "count",
      aggregates: { count: { op: "count" } },
    });
  }

  if (issueTypeField) {
    recipes.push({
      questionId: "agent.support.chart.issue_type",
      title: "Cases by issue type",
      intent: "issue type breakdown",
      panelType: "cartesian",
      markType: "bar",
      vertical: "ops",
      groupBy: issueTypeField,
      xField: issueTypeField,
      yField: "count",
      aggregates: { count: { op: "count" } },
    });
  } else if (productField) {
    recipes.push({
      questionId: "agent.support.chart.product",
      title: "Cases by product",
      intent: "product breakdown bar chart",
      panelType: "cartesian",
      markType: "bar",
      vertical: "ops",
      groupBy: productField,
      xField: productField,
      yField: "count",
      aggregates: { count: { op: "count" } },
    });
  }

  if (severityField && satisfactionField) {
    const bySeverity = avgSatisfactionBySeverity(rows, severityField, satisfactionField);
    if (bySeverity.length > 0) {
      recipes.push({
        questionId: "agent.support.chart.satisfaction_by_severity",
        title: "Avg satisfaction by severity",
        intent: "CSAT by severity for rated cases",
        panelType: "cartesian",
        markType: "bar",
        vertical: "ops",
        preparedRows: bySeverity,
        xField: "Severity",
        yField: "Avg satisfaction",
      });
    }
  }

  recipes.push({
    questionId: "agent.support.table.cases",
    title: "Case register",
    intent: "full support case table",
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
