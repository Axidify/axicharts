import { planDashboardFromRows } from "@axicharts/charts-spec";
import type { AgentPlanOptions, AgentPlanResult } from "./agentPlan";
import type { PipelineEnrichment } from "./pipelineEnrich";
import { fromPipelineEnrichment, toAgentPlanResult } from "./tabularPlanAdapter";

/** C157 — thin wrapper over unified planDashboardFromRows. */
export function agentPlanPipelineDashboard(
  enriched: PipelineEnrichment,
  options: AgentPlanOptions = {},
): AgentPlanResult {
  const plan = planDashboardFromRows(enriched.rows, {
    enrichment: fromPipelineEnrichment(enriched),
    persona: options.persona,
    followUpIntents: options.followUpIntents,
  });
  if (!plan) {
    throw new Error("planDashboardFromRows returned null for pipeline data");
  }
  return toAgentPlanResult(plan);
}
