import type { DataProfile, TemplateId } from "@axicharts/charts-spec";
import {
  planPanelsFromProfile,
  suggestTemplate,
} from "@axicharts/charts-spec";
import { enrichProfileFromIntent } from "./intent";
import type { DashboardPlan, MosaicPresetId, PlannerFeed, PlannerLayout } from "./types";
import { isTemplateId } from "./validate";

function inferLayout(intent: string | undefined): PlannerLayout {
  if (!intent) return "embed";
  const lower = intent.toLowerCase();
  if (/mosaic|wall|grid|multi|split/.test(lower)) return "mosaic";
  return "embed";
}

export function inferFeed(intent: string | undefined): PlannerFeed {
  if (!intent) return "historian";
  const lower = intent.toLowerCase();
  if (/static|snapshot|csv|batch|historical/.test(lower)) return "static";
  if (/\bmqtt\b|sparkplug|plant\/|pubsub|broker/.test(lower)) return "mqtt";
  if (/websocket|web\s*socket|\bws\b|push\s*feed|telemetry\s*stream/.test(lower)) {
    return "websocket";
  }
  if (/live|stream|historian|realtime|real-time|telemetry/.test(lower)) return "historian";
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

export function inferMosaicPresetFromIntent(intent: string): MosaicPresetId {
  const lower = intent.toLowerCase();
  if (
    (/trading|blotter|positions/.test(lower) && /program|sprint|burndown/.test(lower)) ||
    (/trading|blotter/.test(lower) && /mosaic|wall|grid|multi|split/.test(lower))
  ) {
    return "trading-program";
  }
  if (/command|capacity|resource|utilization/.test(lower)) {
    return "command-center";
  }
  if (/finance|p&l|pnl|revenue|margin/.test(lower)) {
    return "ops-finance";
  }
  if (/overview|throughput|kpi/.test(lower)) {
    return "ops-overview";
  }
  if (/program|sprint|burndown/.test(lower)) {
    return "trading-program";
  }
  if (/trading|blotter/.test(lower)) {
    return "trading-program";
  }
  return "ops-overview";
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
    panels: planPanelsFromProfile(enriched),
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
    '  "feed": "static|historian|websocket|mqtt",',
    '  "mosaicPreset": "ops-finance|ops-overview|trading-program|command-center",',
    '  "presentation": boolean,',
    '  "panels": [ { "specVersion": 1, "type": "line|bar|gauge|table|...", "title": "...", "encoding": {...} } ]',
    "}",
    "",
    `Intent: ${intent}`,
    `Profile: ${JSON.stringify(profile)}`,
  ].join("\n");
}
