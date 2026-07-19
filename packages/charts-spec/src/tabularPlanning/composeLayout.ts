import type { DataProfile } from "../types";
import type { TabularPlanBlock } from "./planDashboardFromRows";

export type LayoutVariant =
  | "kpi-strip-2col"
  | "kpi-sidebar-1col"
  | "dense-3col"
  | "table-pinned-bottom";

export type LayoutPlan = {
  variant: LayoutVariant;
  columns: number;
  gap: number;
};

export type ComposeLayoutInput = {
  kpis: TabularPlanBlock[];
  charts: TabularPlanBlock[];
};

export type ComposeLayoutOptions = {
  variant?: LayoutVariant;
  dataProfile?: DataProfile;
};

/**
 * C180 — L6 layout plan from panel set (rules v0).
 */
export function composeLayout(
  panels: ComposeLayoutInput,
  options: ComposeLayoutOptions = {},
): LayoutPlan {
  const chartCount = panels.charts.length;
  const hasTable = panels.charts.some((block) => block.panel.type === "table");

  let variant: LayoutVariant = options.variant ?? "kpi-strip-2col";
  if (hasTable) variant = "table-pinned-bottom";
  else if (chartCount >= 5) variant = "dense-3col";

  const columns =
    variant === "dense-3col" ? 3 : variant === "kpi-sidebar-1col" ? 1 : 2;

  return {
    variant,
    columns,
    gap: 16,
  };
}
