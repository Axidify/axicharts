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

    if (/live|mqtt|websocket|stream|historian/.test(lower)) tags.refresh = "live";

    return { ...metric, tags };
  });

  return { metrics };
}
