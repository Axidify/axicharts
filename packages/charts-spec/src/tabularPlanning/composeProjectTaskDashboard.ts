import type { FieldProfile } from "../types";
import type { PanelRecipe } from "./recipes/types";
import { cellNumber, findNamedField } from "./enrich/types";

const COMPLETED_STATUS = /completed|done|closed/i;
const IN_PROGRESS_STATUS = /in progress|in review|not started|blocked/i;
const PRIORITY_ORDER = ["Critical", "High", "Medium", "Low"] as const;

export function detectProjectTaskTable(fieldProfiles: FieldProfile[]): boolean {
  const names = fieldProfiles.map((profile) => profile.name.toLowerCase());
  const hasProject = names.some((name) => /project/.test(name));
  const hasTask = names.some((name) => name === "task" || /task name/.test(name));
  const hasStatus = names.some((name) => /status/.test(name));
  const hasOwner = names.some((name) => /owner|assignee|assigned/.test(name));
  const hasTicket = names.some((name) => /ticket|incident/.test(name));
  return hasProject && hasTask && hasStatus && hasOwner && !hasTicket;
}

function isCompleted(row: Record<string, unknown>, statusField: string): boolean {
  return COMPLETED_STATUS.test(String(row[statusField] ?? ""));
}

function avgProgress(rows: Record<string, unknown>[], progressField: string): number {
  if (rows.length === 0) return 0;
  const total = rows.reduce((sum, row) => sum + cellNumber(row, progressField), 0);
  return Math.round((total / rows.length) * 10) / 10;
}

function avgProgressByPriority(
  rows: Record<string, unknown>[],
  priorityField: string,
  progressField: string,
): Record<string, unknown>[] {
  const buckets = new Map<string, { sum: number; count: number }>();
  for (const row of rows) {
    const priority = String(row[priorityField] ?? "Unknown");
    const bucket = buckets.get(priority) ?? { sum: 0, count: 0 };
    bucket.sum += cellNumber(row, progressField);
    bucket.count += 1;
    buckets.set(priority, bucket);
  }

  return [...buckets.entries()]
    .map(([priority, bucket]) => ({
      Priority: priority,
      "Avg progress": Math.round((bucket.sum / bucket.count) * 10) / 10,
    }))
    .sort((left, right) => {
      const li = PRIORITY_ORDER.indexOf(left.Priority as (typeof PRIORITY_ORDER)[number]);
      const ri = PRIORITY_ORDER.indexOf(right.Priority as (typeof PRIORITY_ORDER)[number]);
      return (li === -1 ? 99 : li) - (ri === -1 ? 99 : ri);
    });
}

/**
 * Agent-style compose for project / task tracker tables.
 */
export function suggestProjectTaskAnalytics(
  rows: Record<string, unknown>[],
  fieldProfiles: FieldProfile[],
): PanelRecipe[] {
  const statusField = findNamedField(fieldProfiles, /status/i);
  const priorityField = findNamedField(fieldProfiles, /priority/i);
  const ownerField = findNamedField(fieldProfiles, /owner|assignee|assigned/i);
  const projectField = findNamedField(fieldProfiles, /project/i);
  const progressField = findNamedField(fieldProfiles, /progress|completion|percent/i);

  if (!statusField) return [];

  const activeCount = rows.filter(
    (row) => !isCompleted(row, statusField) && IN_PROGRESS_STATUS.test(String(row[statusField] ?? "")),
  ).length;
  const completedCount = rows.filter((row) => isCompleted(row, statusField)).length;
  const highPriorityCount = priorityField
    ? rows.filter((row) => /critical|high/i.test(String(row[priorityField] ?? ""))).length
    : 0;

  const recipes: PanelRecipe[] = [
    {
      questionId: "agent.project.kpi.total",
      title: "Total tasks",
      intent: "task count",
      panelType: "stat",
      vertical: "ops",
      kpiValue: rows.length,
      kpiLabel: "Total tasks",
    },
    {
      questionId: "agent.project.kpi.active",
      title: "Active tasks",
      intent: "in-flight task count",
      panelType: "stat",
      vertical: "ops",
      kpiValue: activeCount,
      kpiLabel: "Active tasks",
    },
    {
      questionId: "agent.project.kpi.completed",
      title: "Completed",
      intent: "completed task count",
      panelType: "stat",
      vertical: "ops",
      kpiValue: completedCount,
      kpiLabel: "Completed",
    },
  ];

  if (progressField) {
    recipes.push({
      questionId: "agent.project.kpi.avg_progress",
      title: "Avg progress",
      intent: "mean completion percent",
      panelType: "stat",
      vertical: "ops",
      kpiValue: avgProgress(rows, progressField),
      kpiLabel: "Avg progress %",
    });
  } else if (priorityField && highPriorityCount > 0) {
    recipes.push({
      questionId: "agent.project.kpi.high_priority",
      title: "High priority",
      intent: "critical or high priority tasks",
      panelType: "stat",
      vertical: "ops",
      kpiValue: highPriorityCount,
      kpiLabel: "High priority",
    });
  }

  recipes.push({
    questionId: "agent.project.chart.status",
    title: "Tasks by status",
    intent: "status breakdown bar chart",
    panelType: "cartesian",
    markType: "bar",
    vertical: "ops",
    groupBy: statusField,
    xField: statusField,
    yField: "count",
    aggregates: { count: { op: "count" } },
  });

  if (priorityField) {
    recipes.push({
      questionId: "agent.project.chart.priority",
      title: "Tasks by priority",
      intent: "priority breakdown bar chart",
      panelType: "cartesian",
      markType: "bar",
      vertical: "ops",
      groupBy: priorityField,
      xField: priorityField,
      yField: "count",
      aggregates: { count: { op: "count" } },
    });

    if (progressField) {
      const byPriority = avgProgressByPriority(rows, priorityField, progressField);
      if (byPriority.length > 0) {
        recipes.push({
          questionId: "agent.project.chart.progress_by_priority",
          title: "Avg progress by priority",
          intent: "completion percent by priority",
          panelType: "cartesian",
          markType: "bar",
          vertical: "ops",
          preparedRows: byPriority,
          xField: "Priority",
          yField: "Avg progress",
        });
      }
    }
  }

  if (ownerField) {
    recipes.push({
      questionId: "agent.project.chart.owner",
      title: "Tasks by owner",
      intent: "workload by owner",
      panelType: "cartesian",
      markType: "bar",
      vertical: "ops",
      groupBy: ownerField,
      xField: ownerField,
      yField: "count",
      aggregates: { count: { op: "count" } },
    });
  } else if (projectField) {
    recipes.push({
      questionId: "agent.project.chart.project",
      title: "Tasks by project",
      intent: "project workload breakdown",
      panelType: "cartesian",
      markType: "bar",
      vertical: "ops",
      groupBy: projectField,
      xField: projectField,
      yField: "count",
      aggregates: { count: { op: "count" } },
    });
  }

  recipes.push({
    questionId: "agent.project.table.tasks",
    title: "Task register",
    intent: "full task table",
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
