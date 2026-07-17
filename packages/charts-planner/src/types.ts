export type PlannerSource = "rules" | "intent" | "llm";

export type PlannerLayout = "embed" | "mosaic";

export type PlannerFeed = "static" | "historian";

export type MosaicPresetId =
  | "ops-finance"
  | "ops-overview"
  | "trading-program"
  | "command-center";

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
  warnings?: string[];
};

export type PlannerRequest = {
  profile: import("@axicharts/charts-spec").DataProfile;
  intent?: string;
};

export type LlmPlannerProvider = {
  id: string;
  complete: (prompt: string) => Promise<string>;
};
