import type { DashboardPlan } from "@axicharts/charts-planner";
import type { LayoutPlan } from "@axicharts/charts-spec/planning";
import type {
  CartesianValidationIssue,
  DataProfile,
  PanelSpec,
  Persona,
} from "@axicharts/charts-spec";
import type { DomainSemantics } from "@axicharts/charts-spec/planning";

export type AgentDecision = {
  step: string;
  api: string;
  intent?: string;
  status: "ok" | "needs_review" | "validated";
  notes: string;
};

export type AgentChartBlock = {
  questionId: string;
  panel: PanelSpec;
  rows: Array<Record<string, string | number | boolean>>;
  decision: AgentDecision;
  validationIssues: CartesianValidationIssue[];
};

export type OrchestratorPlanResult = {
  dashboardIntent: string;
  dashboardPlan: DashboardPlan;
  kpis: AgentChartBlock[];
  charts: AgentChartBlock[];
  decisions: AgentDecision[];
  dataProfile: DataProfile;
  persona: Persona;
  vertical: string;
  domain: DomainSemantics;
  layout?: LayoutPlan;
  planSource?: "l4a" | "l4b";
  summary: {
    kpiCount: number;
    chartCount: number;
    needsReview: boolean;
  };
};

export type ByokConfig = {
  apiKey: string;
  model?: string;
  baseUrl?: string;
};

export type OrchestratorChatRequest = {
  csv?: string;
  rows?: Array<Record<string, unknown>>;
  persona?: Persona;
  followUpIntents?: string[];
  intent?: string;
  message?: string;
};

export type OrchestratorChatResult = OrchestratorPlanResult & {
  followUpIntents: string[];
  assistantMessage: string;
  llm: {
    used: boolean;
    provider?: string;
    notes?: string;
  };
};
