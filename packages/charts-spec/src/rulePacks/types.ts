import type { MetricProfile, PanelSpec, FieldProfile } from "../types";

export type VerticalId = "finance" | "ledger" | "trading" | "ops" | "attendance" | "sales";

export type VerticalPanelContext = {
  metric: MetricProfile;
  intent?: string;
  profileFields?: string[];
  fieldProfiles?: FieldProfile[];
  allMetrics?: MetricProfile[];
};

export type VerticalRulePack = {
  id: VerticalId;
  colorFieldPriority: readonly string[];
  sizeFieldPriority: readonly string[];
  extraColorIntent?: RegExp;
  extraSizeIntent?: RegExp;
  applyPanelRules: (panel: PanelSpec, ctx: VerticalPanelContext) => PanelSpec;
};
