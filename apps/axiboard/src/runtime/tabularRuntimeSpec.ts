import type { RuntimeDashboardSpec } from "@axicharts/charts-runtime";
import type { OrchestratorChatResult } from "../api/orchestratorClient";

export function buildTabularRuntimeSpec(
  plan: OrchestratorChatResult,
  sourceCsv: string,
): RuntimeDashboardSpec {
  const layout = plan.layout;
  return {
    layout: "panels",
    panels: {
      title: plan.dashboardPlan.title,
      subtitle: plan.dashboardPlan.subtitle,
      theme: plan.dashboardPlan.theme,
      mode: "static",
      vertical: plan.vertical,
      columns: layout?.columns ?? 2,
      gap: layout?.gap ?? 16,
      layoutVariant: layout?.variant,
      sourceCsv,
      decisions: plan.decisions.map(({ step, api, intent, status, notes }) => ({
        step,
        api,
        intent,
        status,
        notes,
      })),
      kpis: plan.kpis.map(({ questionId, panel, rows, decision }) => ({
        questionId,
        panel,
        rows,
        rationale: decision.notes,
        intent: decision.intent,
      })),
      charts: plan.charts.map(({ questionId, panel, rows, decision }) => ({
        questionId,
        panel,
        rows,
        rationale: decision.notes,
        intent: decision.intent,
      })),
    },
  };
}

export function isPanelsRuntimeSpec(
  spec: RuntimeDashboardSpec,
): spec is Extract<RuntimeDashboardSpec, { layout: "panels" }> {
  return spec.layout === "panels";
}
