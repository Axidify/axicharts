import type { RuntimeDashboardSpec } from "@axicharts/charts-runtime";
import type { OrchestratorChatResult } from "../api/orchestratorClient";

export type PanelsRuntimeSpec = Extract<RuntimeDashboardSpec, { layout: "panels" }>;

export function buildTabularRuntimeSpec(
  plan: OrchestratorChatResult,
  sourceCsv: string,
): PanelsRuntimeSpec {
  const layout = plan.layout;
  return {
    layout: "panels",
    panels: {
      title: plan.dashboardPlan.title,
      subtitle: plan.dashboardPlan.subtitle,
      // Planner plans carry the theme as a plain string drawn from the theme names.
      theme: plan.dashboardPlan.theme as PanelsRuntimeSpec["panels"]["theme"],
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

export function isPanelsRuntimeSpec(spec: RuntimeDashboardSpec): spec is PanelsRuntimeSpec {
  return spec.layout === "panels";
}
