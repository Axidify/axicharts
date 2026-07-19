import type { RuntimeDashboardSpec } from "@axicharts/charts-runtime";
import type { OrchestratorChatResult } from "../api/orchestratorClient";

export function buildTabularRuntimeSpec(
  plan: OrchestratorChatResult,
  sourceCsv: string,
): RuntimeDashboardSpec {
  return {
    layout: "panels",
    panels: {
      title: plan.dashboardPlan.title,
      subtitle: plan.dashboardPlan.subtitle,
      theme: plan.dashboardPlan.theme,
      mode: "static",
      vertical: plan.vertical,
      sourceCsv,
      kpis: plan.kpis.map(({ questionId, panel, rows }) => ({ questionId, panel, rows })),
      charts: plan.charts.map(({ questionId, panel, rows }) => ({ questionId, panel, rows })),
    },
  };
}

export function isPanelsRuntimeSpec(
  spec: RuntimeDashboardSpec,
): spec is Extract<RuntimeDashboardSpec, { layout: "panels" }> {
  return spec.layout === "panels";
}
