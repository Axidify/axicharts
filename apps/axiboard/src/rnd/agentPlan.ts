import type { DashboardPlan } from "@axicharts/charts-planner";
import { planDashboardFromRows } from "@axicharts/charts-spec";
import type {
  CartesianValidationIssue,
  DataProfile,
  PanelSpec,
  Persona,
} from "@axicharts/charts-spec";
import type { LedgerEnrichment } from "./ledgerEnrich";
import { fromLedgerEnrichment, toAgentPlanResult } from "./tabularPlanAdapter";

export type AgentDecision = {
  step: string;
  api: string;
  intent?: string;
  status: "ok" | "needs_review" | "validated";
  notes: string;
};

export type AgentChartBlock = {
  panel: PanelSpec;
  rows: Array<Record<string, string | number | boolean>>;
  decision: AgentDecision;
  validationIssues: CartesianValidationIssue[];
};

export type AgentPlanResult = {
  dashboardIntent: string;
  dashboardPlan: DashboardPlan;
  kpis: AgentChartBlock[];
  charts: AgentChartBlock[];
  decisions: AgentDecision[];
  dataProfile: DataProfile;
};

export type AgentPlanOptions = {
  followUpIntents?: string[];
  persona?: Persona;
};

/** C157 — thin wrapper over unified planDashboardFromRows. */
export function agentPlanLedgerDashboard(
  enriched: LedgerEnrichment,
  options: AgentPlanOptions = {},
): AgentPlanResult {
  const plan = planDashboardFromRows(enriched.rows, {
    enrichment: fromLedgerEnrichment(enriched),
    persona: options.persona,
    followUpIntents: options.followUpIntents,
  });
  if (!plan) {
    throw new Error("planDashboardFromRows returned null for ledger data");
  }
  return toAgentPlanResult(plan);
}
