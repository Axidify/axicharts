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

## OpenAI-compatible provider

Set `OPENAI_API_KEY` (or `AXICHARTS_PLANNER_API_KEY`) and start the server:

```bash
export OPENAI_API_KEY=sk-...
pnpm planner
# or: charts-planner serve --provider openai
```

Optional env:

| Variable | Default |
|----------|---------|
| `OPENAI_MODEL` / `AXICHARTS_PLANNER_MODEL` | `gpt-4o-mini` |
| `OPENAI_BASE_URL` / `AXICHARTS_PLANNER_BASE_URL` | `https://api.openai.com/v1` |

CLI with LLM:

```bash
charts-planner plan examples/ops.profile.json --intent "Finance board deck" --llm
```

Programmatic:

```ts
import {
  createOpenAiChatProvider,
  planWithProvider,
  resolvePlannerProviderFromEnv,
} from "@axicharts/charts-planner";

const provider = resolvePlannerProviderFromEnv();
// or createOpenAiChatProvider({ apiKey, model, baseUrl })
```

Invalid LLM JSON always falls back to the rules planner with a warning on the plan.

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
