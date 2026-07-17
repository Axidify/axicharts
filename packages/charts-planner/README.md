# @axicharts/charts-planner

Server-side dashboard planner for AxiCharts Phase 3. Converts metric profiles and natural-language intent into validated `charts-spec` plans, with rules fallback when LLM output is invalid.

## Install

```bash
npm install @axicharts/charts-planner @axicharts/charts-spec
```

## Rules + intent planner

```ts
import { DEFAULT_OPS_PROFILE, planFromIntent } from "@axicharts/charts-planner";

const plan = planFromIntent(DEFAULT_OPS_PROFILE, "Line 3 night shift overview");
// → { template: "ops-2x2", layout: "embed", feed: "historian", panels: [...] }
```

## LLM provider (server only)

```ts
import { createMockPlannerProvider, planWithProvider } from "@axicharts/charts-planner";

const plan = await planWithProvider(profile, intent, createMockPlannerProvider(json));
```

## HTTP server

```bash
npx @axicharts/charts-planner serve --port 3921
```

```bash
curl -s http://127.0.0.1:3921/plan \
  -H 'content-type: application/json' \
  -d '{"profile":{"metrics":[{"name":"cpu","unit":"%"}]},"intent":"Line 3 night shift"}'
```

## CLI

```bash
charts-planner plan examples/ops.profile.json --intent "Line 3 night shift overview"
charts-planner serve --port 3921
```
