import { planDashboardShellFromIntent } from "./planShell";
import type { DashboardPlan } from "./types";
import {
  planDashboardFromRows as planTabularDashboard,
  type PlanDashboardFromRowsOptions,
  type TabularDashboardPlan,
  type TabularPlanDecision,
} from "@axicharts/charts-spec/planning";

export type PlannerDashboardPlan = TabularDashboardPlan & {
  dashboardPlan: DashboardPlan;
};

export type PlannerDashboardOptions = PlanDashboardFromRowsOptions;

/**
 * C157 — unified tabular planner with dashboard shell from charts-planner.
 */
export function planDashboardFromRows(
  rows: Record<string, unknown>[],
  options: PlannerDashboardOptions = {},
): PlannerDashboardPlan | null {
  const tabular = planTabularDashboard(rows, options);
  if (!tabular) return null;

  const dashboardPlan = planDashboardShellFromIntent(tabular.dataProfile, tabular.dashboardIntent);
  const shellDecision: TabularPlanDecision = {
    step: "Dashboard shell",
    api: "planDashboardShellFromIntent",
    intent: tabular.dashboardIntent,
    status: "ok",
    notes: `template ${dashboardPlan.template}, feed ${dashboardPlan.feed}, tabular panels ${tabular.kpis.length + tabular.charts.length}`,
  };

  return {
    ...tabular,
    dashboardPlan,
    decisions: [...tabular.decisions, shellDecision],
  };
}

export type {
  PlanDashboardFromRowsOptions,
  TabularDashboardPlan,
  TabularPlanBlock,
  TabularPlanDecision,
  TabularEnrichment,
} from "@axicharts/charts-spec";
