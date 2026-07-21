export type PlannerSource = "rules" | "intent" | "llm";

export type PlannerLayout = "embed" | "mosaic";

export type PlannerFeed = "static" | "historian" | "websocket" | "mqtt" | "rest" | "mock-live";

export type MosaicPresetId =
  | "ops-finance"
  | "ops-overview"
  | "trading-program"
  | "command-center";

export type PlannerKind = "legacy-profile" | "tabular";

export type DashboardPlan = {
  source: PlannerSource;
  template: string;
  title?: string;
  subtitle?: string;
  theme?: string;
  mode?: string;
  layout: PlannerLayout;
  feed: PlannerFeed;
  presentation: boolean;
  mosaicPreset?: MosaicPresetId;
  panels: import("@axicharts/charts-spec").PanelSpec[];
  /** False for profile planner (`plan.ts`) — use tabular `planDashboardFromRows` for agents. */
  agentSafe?: boolean;
  plannerKind?: PlannerKind;
  warnings?: string[];
};

export type PlannerRequest = {
  profile: import("@axicharts/charts-spec").DataProfile;
  intent?: string;
  /** When true, server rejects — profile planner is not agent grammar (B3). */
  agent?: boolean;
};

export type LlmPlannerProvider = {
  id: string;
  complete: (prompt: string) => Promise<string>;
};
