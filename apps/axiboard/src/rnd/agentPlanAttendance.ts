import { planDashboardFromRows } from "@axicharts/charts-spec";
import type { AgentPlanOptions, AgentPlanResult } from "./agentPlan";
import type { AttendanceEnrichment } from "./attendanceEnrich";
import { fromAttendanceEnrichment, toAgentPlanResult } from "./tabularPlanAdapter";

/** C157 — thin wrapper over unified planDashboardFromRows. */
export function agentPlanAttendanceDashboard(
  enriched: AttendanceEnrichment,
  options: AgentPlanOptions = {},
): AgentPlanResult {
  const plan = planDashboardFromRows(enriched.rows, {
    enrichment: fromAttendanceEnrichment(enriched),
    persona: options.persona,
    followUpIntents: options.followUpIntents,
  });
  if (!plan) {
    throw new Error("planDashboardFromRows returned null for attendance data");
  }
  return toAgentPlanResult(plan);
}
