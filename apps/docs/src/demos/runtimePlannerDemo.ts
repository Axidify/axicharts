export const PLANNER_CLI_CODE = `# Rules intent planner (stdout JSON plan)
charts-planner plan packages/charts-planner/examples/ops.profile.json \\
  --intent "REST API polling /api/metrics endpoint"

# Write plan to disk
charts-planner plan packages/charts-planner/examples/ops.profile.json \\
  --intent "Line 3 night shift overview" \\
  --out /tmp/plan.json

# LLM provider (needs OPENAI_API_KEY)
charts-planner plan packages/charts-planner/examples/ops.profile.json \\
  --intent "Finance board deck" --llm`;

export const PLANNER_SERVE_CODE = `# Rules planner HTTP server (local fallback)
pnpm planner

# OpenAI-compatible provider (optional)
export OPENAI_API_KEY=sk-...
charts-planner serve --port 3921 --provider openai`;

export const PLANNER_HEALTH_CURL = `curl -s http://127.0.0.1:3921/health`;

export const PLANNER_HEALTH_RESPONSE = `{
  "ok": true,
  "provider": "rules"
}`;

export const PLANNER_PLAN_CURL_INLINE = `curl -s http://127.0.0.1:3921/plan \\
  -H 'content-type: application/json' \\
  -d '{
    "profile": {
      "metrics": [
        { "name": "cpu", "unit": "%", "tags": { "vertical": "ops", "refresh": "live" } }
      ]
    },
    "intent": "WebSocket push feed trading desk"
  }'`;

export const PLANNER_PLAN_RESPONSE = `{
  "source": "intent",
  "template": "ops-2x2",
  "layout": "embed",
  "feed": "rest",
  "presentation": false,
  "panels": [ ... ]
}`;

export const DASHBOARDER_PLANNER_ENV = `# apps/axiboard/.env.local
VITE_PLANNER_URL=http://127.0.0.1:3921`;

export const PLANNER_TRACK_RELEASE_NOTES = [
  { slice: "C33", summary: "PlannerPanel adapter preset hints, RuntimeHubNav across runtime pages" },
  { slice: "C34", summary: "Planner WS/MQTT feed intents, Axiboard feed gallery deep links" },
  { slice: "C35", summary: "REST feed intent, builder AdapterHealthStrip fixture gallery links" },
  { slice: "C36", summary: "Mock-live feed intent, mosaic multi-adapter fixture hints" },
  { slice: "C37", summary: "PLANNER_FEED_ROWS index, import gallery planner cross-links" },
  { slice: "C38", summary: "Runtime planner HTTP examples, Axiboard FeedIntentGlossary" },
  { slice: "C39", summary: "Planner CLI on Start page, EmbedDialog feed/intent gallery hints" },
  { slice: "C40", summary: "ShareDialog planner meta export, Spec page Phase 3 planner section" },
  { slice: "C41", summary: "ImportDialog planner meta restore hints, planner track release notes" },
  { slice: "C42", summary: "Runtime adapters planner feed column, share-import round-trip docs" },
  { slice: "C43", summary: "RuntimeHubNav share-import link, ShareDialog/ImportDialog Storybook fixtures" },
] as const;

export const SHARE_EXPORT_META_EXAMPLE = `{
  "$schema": "https://axidify.github.io/axicharts/schema/share-export.schema.json",
  "version": 1,
  "kind": "dashboard",
  "exportedAt": "2026-07-18T00:00:00.000Z",
  "name": "Line 3 ops",
  "meta": {
    "layout": "embed",
    "feed": "rest",
    "template": "ops-2x2",
    "presentation": false
  },
  "spec": {
    "layout": "embed",
    "dashboard": {
      "template": "ops-2x2",
      "mode": "live",
      "dataSource": {
        "type": "rest",
        "url": "/api/metrics",
        "intervalMs": 2000
      }
    }
  }
}`;

export const PLANNER_CLIENT_CODE = `import { requestDashboardPlan, fetchPlannerHealth } from "@axicharts/charts-planner";

const health = await fetchPlannerHealth("http://127.0.0.1:3921");
const plan = await requestDashboardPlan({
  profile,
  intent: "MQTT plant floor sparkplug telemetry",
  serverUrl: "http://127.0.0.1:3921",
});`;
