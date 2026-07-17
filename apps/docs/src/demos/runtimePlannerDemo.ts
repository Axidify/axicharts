export const PLANNER_SERVE_CODE = `# Rules planner (local fallback)
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

export const PLANNER_PLAN_CURL_FILE = `curl -s http://127.0.0.1:3921/plan \\
  -H 'content-type: application/json' \\
  --data-binary @- <<'EOF'
{
  "profile": $(cat packages/charts-planner/examples/ops.profile.json),
  "intent": "REST API polling /api/metrics endpoint"
}
EOF`;

export const PLANNER_PLAN_RESPONSE = `{
  "source": "intent",
  "template": "ops-2x2",
  "layout": "embed",
  "feed": "rest",
  "presentation": false,
  "panels": [ ... ]
}`;

export const DASHBOARDER_PLANNER_ENV = `# apps/dashboarder/.env.local
VITE_PLANNER_URL=http://127.0.0.1:3921`;

export const PLANNER_CLIENT_CODE = `import { requestDashboardPlan, fetchPlannerHealth } from "@axicharts/charts-planner";

const health = await fetchPlannerHealth("http://127.0.0.1:3921");
const plan = await requestDashboardPlan({
  profile,
  intent: "MQTT plant floor sparkplug telemetry",
  serverUrl: "http://127.0.0.1:3921",
});`;
