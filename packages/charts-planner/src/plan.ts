import type { DataProfile, TemplateId } from "@axicharts/charts-spec";
import {
  planPanelsFromProfile,
  suggestTemplate,
} from "@axicharts/charts-spec";
import { enrichProfileFromIntent } from "./intent";
import type { DashboardPlan, PlannerFeed, PlannerLayout } from "./types";
import { isTemplateId } from "./validate";

function inferLayout(intent: string | undefined): PlannerLayout {
  if (!intent) return "embed";
  const lower = intent.toLowerCase();
  if (/mosaic|wall|grid|multi|split/.test(lower)) return "mosaic";
  return "embed";
}

function inferFeed(intent: string | undefined): PlannerFeed {
  if (!intent) return "historian";
  const lower = intent.toLowerCase();
  if (/static|snapshot|csv|batch|historical/.test(lower)) return "static";
  if (/live|mqtt|websocket|stream|historian|realtime|real-time/.test(lower)) return "historian";
  return "historian";
}

function inferPresentation(intent: string | undefined): boolean {
  if (!intent) return false;
  const lower = intent.toLowerCase();
  return /presentation|board|deck|slide|executive|hero/.test(lower);
}

export function inferTemplateFromIntent(intent: string): TemplateId | undefined {
  const lower = intent.toLowerCase();
  if (/finance|p&l|pnl|revenue|margin/.test(lower)) return "finance-pnl";
  if (/trading|blotter|positions/.test(lower)) return "trading-blotter";
  if (/program|burndown|sprint/.test(lower)) return "program-dashboard";
  if (/plugin|extension/.test(lower)) return "plugins-wall";
  if (/capacity|resource|utilization/.test(lower)) return "capacity-grid";
  if (/line\s*\d+|ops|shift|plant|telemetry|2x2|wall/.test(lower)) return "ops-2x2";
  if (/overview|single|kpi/.test(lower)) return "line-overview";
  return undefined;
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

  return {
    source: intent ? "intent" : "rules",
    template,
    title: inferTitle(intent),
    subtitle: inferSubtitle(intent),
    theme: presentation ? "presentation" : undefined,
    mode: presentation ? "presentation" : undefined,
    layout: inferLayout(intent),
    feed: inferFeed(intent),
    presentation,
    panels: planPanelsFromProfile(enriched),
  };
}

export function planFromIntent(profile: DataProfile, intent: string): DashboardPlan {
  const enriched = enrichProfileFromIntent(profile, intent);
  const template = inferTemplateFromIntent(intent) ?? suggestTemplate(enriched);
  const resolvedTemplate = isTemplateId(template) ? template : suggestTemplate(enriched);
  const presentation = inferPresentation(intent);

  return {
    source: "intent",
    template: resolvedTemplate,
    title: inferTitle(intent),
    subtitle: inferSubtitle(intent),
    theme: presentation ? "presentation" : undefined,
    mode: presentation ? "presentation" : undefined,
    layout: inferLayout(intent),
    feed: inferFeed(intent),
    presentation,
    panels: planPanelsFromProfile(enriched),
  };
}

export function buildPlannerPrompt(profile: DataProfile, intent: string): string {
  return [
    "You are a dashboard planner. Return ONLY JSON matching this shape:",
    "{",
    '  "template": "ops-2x2|finance-pnl|trading-blotter|capacity-grid|line-overview|plugins-wall|program-dashboard",',
    '  "title": "string",',
    '  "subtitle": "string",',
    '  "theme": "clean|live|industrial|presentation",',
    '  "mode": "static|interactive|live|presentation",',
    '  "layout": "embed|mosaic",',
    '  "feed": "static|historian",',
    '  "presentation": boolean,',
    '  "panels": [ { "specVersion": 1, "type": "line|bar|gauge|table|...", "title": "...", "encoding": {...} } ]',
    "}",
    "",
    `Intent: ${intent}`,
    `Profile: ${JSON.stringify(profile)}`,
  ].join("\n");
}
