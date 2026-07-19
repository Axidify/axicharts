import type { OrchestratorChatResult } from "../api/orchestratorClient";

export function formatAssistantMeta(result: OrchestratorChatResult): string {
  const parts = [
    `${result.summary.kpiCount} metrics`,
    `${result.summary.chartCount} charts`,
    "auto-planned",
  ];
  if (result.llm.used) parts.push("LLM-assisted");
  return parts.join(" · ");
}

export function formatDashboardStatus(result: OrchestratorChatResult): string {
  const panelCount = result.summary.kpiCount + result.summary.chartCount;
  const layout = result.layout?.variant?.replace(/-/g, " ") ?? "default layout";
  return `${panelCount} panels · ${layout}`;
}
