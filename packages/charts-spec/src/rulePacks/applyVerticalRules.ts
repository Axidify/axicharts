import type { FieldProfile, MetricProfile, PanelSpec } from "../types";
import { resolveVerticalId, rulePackForVertical } from "./index";
import type { VerticalPanelContext } from "./types";

export type ApplyVerticalRulesContext = {
  metric: MetricProfile;
  intent?: string;
  profileFields?: string[];
  fieldProfiles?: FieldProfile[];
  allMetrics?: MetricProfile[];
};

export function applyVerticalRules(
  panel: PanelSpec,
  ctx: ApplyVerticalRulesContext,
): PanelSpec {
  const verticalCtx: VerticalPanelContext = {
    metric: ctx.metric,
    intent: ctx.intent,
    profileFields: ctx.profileFields,
    fieldProfiles: ctx.fieldProfiles,
    allMetrics: ctx.allMetrics,
  };

  const vertical = resolveVerticalId(verticalCtx);
  const pack = rulePackForVertical(vertical);
  if (!pack) return panel;

  return pack.applyPanelRules(panel, verticalCtx);
}
