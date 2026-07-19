import type { DataProfile } from "@axicharts/charts-spec";

export function enrichProfileFromIntent(profile: DataProfile, intent: string): DataProfile {
  const lower = intent.toLowerCase();

  const metrics = profile.metrics.map((metric) => {
    const tags = { ...metric.tags };

    if (/finance|p&l|pnl|revenue|margin/.test(lower)) tags.vertical = "finance";
    if (/trading|blotter|positions|orders/.test(lower)) tags.vertical = "trading";
    if (/program|burndown|sprint|roadmap/.test(lower)) tags.vertical = "program";
    if (/plugin|extension/.test(lower)) tags.vertical = "plugins";
    if (/capacity|resource|utilization/.test(lower)) tags.vertical = "resources";
    if (/ops|line|shift|plant|telemetry|tag/.test(lower)) tags.vertical = "ops";
    if (/pipeline|crm|opportunity|sales funnel|weighted forecast|deal/.test(lower)) {
      tags.vertical = "sales";
    }
    if (/attendance|timesheet|clock[\s-]?in|hr\b|payroll|leave|present|employee/.test(lower)) {
      tags.vertical = "attendance";
    }
    if (/ledger|journal|gl\b|payment method|debit|credit/.test(lower)) tags.vertical = "ledger";

    if (/live|mqtt|websocket|stream|historian/.test(lower)) tags.refresh = "live";

    return { ...metric, tags };
  });

  return { metrics, fields: profile.fields, fieldProfiles: profile.fieldProfiles };
}
