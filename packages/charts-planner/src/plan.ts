import type { DataProfile } from "@axicharts/charts-spec/planning";
import {
  PROFILE_PLANNER_AGENT_WARNING,
  planPanelsFromProfile,
  suggestTemplate,
} from "@axicharts/charts-spec";
import { enrichProfileFromIntent } from "./intent";
import {
  inferFeed,
  inferMosaicPresetFromIntent,
  inferTemplateFromIntent,
  planDashboardShellFromIntent,
} from "./planShell";
import type { DashboardPlan, MosaicPresetId, PlannerLayout } from "./types";
import { isTemplateId } from "./validate";

export {
  inferFeed,
  inferMosaicPresetFromIntent,
  inferTemplateFromIntent,
  planDashboardShellFromIntent,
} from "./planShell";

function inferLayout(intent: string | undefined): PlannerLayout {
  if (!intent) return "embed";
  const lower = intent.toLowerCase();
  if (/mosaic|wall|grid|multi|split/.test(lower)) return "mosaic";
  return "embed";
}

function inferPresentation(intent: string | undefined): boolean {
  if (!intent) return false;
  const lower = intent.toLowerCase();
  return /presentation|board|deck|slide|executive|hero/.test(lower);
}

function resolveMosaicPreset(intent: string | undefined, layout: PlannerLayout): MosaicPresetId | undefined {
  if (layout !== "mosaic" || !intent) return undefined;
  return inferMosaicPresetFromIntent(intent);
}

function inferTitle(intent: string | undefined): string | undefined {
  if (!intent) return undefined;
  const lineMatch = intent.match(/line\s*(\d+)/i);
  if (lineMatch) return `Line ${lineMatch[1]}`;
  return undefined;
}

function inferSubtitle(intent: string | undefined): string | undefined {
  if (!intent) return undefined;
  const lower = intent.toLowerCase();
  if (/night shift/.test(lower)) return "Night shift overview";
  if (/day shift/.test(lower)) return "Day shift overview";
  if (/maintenance/.test(lower)) return "Maintenance window";
  return undefined;
}

export function planFromProfile(
  profile: DataProfile,
  intent?: string,
): DashboardPlan {
  const enriched = intent ? enrichProfileFromIntent(profile, intent) : profile;
  const template = suggestTemplate(enriched);
  const presentation = inferPresentation(intent);
  const layout = inferLayout(intent);

  return {
    source: intent ? "intent" : "rules",
    template,
    title: inferTitle(intent),
    subtitle: inferSubtitle(intent),
    theme: presentation ? "presentation" : undefined,
    mode: presentation ? "presentation" : undefined,
    layout,
    feed: inferFeed(intent),
    presentation,
    mosaicPreset: resolveMosaicPreset(intent, layout),
    panels: planPanelsFromProfile(enriched, { intent }),
    agentSafe: false,
    plannerKind: "legacy-profile",
    warnings: [PROFILE_PLANNER_AGENT_WARNING],
  };
}

export function planFromIntent(profile: DataProfile, intent: string): DashboardPlan {
  const enriched = enrichProfileFromIntent(profile, intent);
  const template = inferTemplateFromIntent(intent) ?? suggestTemplate(enriched);
  const resolvedTemplate = isTemplateId(template) ? template : suggestTemplate(enriched);
  const presentation = inferPresentation(intent);
  const layout = inferLayout(intent);

  return {
    source: "intent",
    template: resolvedTemplate,
    title: inferTitle(intent),
    subtitle: inferSubtitle(intent),
    theme: presentation ? "presentation" : undefined,
    mode: presentation ? "presentation" : undefined,
    layout,
    feed: inferFeed(intent),
    presentation,
    mosaicPreset: resolveMosaicPreset(intent, layout),
    panels: planPanelsFromProfile(enriched, { intent }),
    agentSafe: false,
    plannerKind: "legacy-profile",
    warnings: [PROFILE_PLANNER_AGENT_WARNING],
  };
}

export function buildPlannerPrompt(profile: DataProfile, intent: string): string {
  return [
    "You are a dashboard planner. Return ONLY JSON matching this shape:",
    "{",
    '  "template": "ops-2x2|finance-pnl|trading-blotter|capacity-grid|line-overview|plugins-wall|program-dashboard|sre-incident|saas-growth|<community-id>",',
    '  "title": "string",',
    '  "subtitle": "string",',
    '  "theme": "clean|live|industrial|presentation",',
    '  "mode": "static|interactive|live|presentation",',
    '  "layout": "embed|mosaic",',
    '  "feed": "static|historian|websocket|mqtt|rest|mock-live",',
    '  "mosaicPreset": "ops-finance|ops-overview|trading-program|command-center",',
    '  "presentation": boolean,',
    '  "panels": [ { "specVersion": 1, "type": "cartesian", "title": "...", "encoding": { "x": { "field": "week", "type": "nominal" }, "color": { "field": "aboveTarget", "type": "semantic" } }, "marks": [ { "type": "bar", "field": "revenue", "label": "Revenue" }, { "type": "line", "field": "target", "label": "Target" }, { "type": "rule", "value": 90, "label": "SLO" } ] } ]',
    "}",
    "",
    `Intent: ${intent}`,
    `Profile: ${JSON.stringify(profile)}`,
  ].join("\n");
}
