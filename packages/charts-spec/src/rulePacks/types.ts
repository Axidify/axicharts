import type { MetricProfile, PanelSpec } from "../types";

export type VerticalId = "finance" | "trading" | "ops";

export type VerticalPanelContext = {
  metric: MetricProfile;
  intent?: string;
  profileFields?: string[];
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
