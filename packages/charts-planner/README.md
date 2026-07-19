# @axicharts/charts-planner

Server-side dashboard planner for AxiCharts. Converts metric profiles and natural-language intent into validated `charts-spec` plans, with rules fallback when LLM output is invalid.

**Cartesian panels (RFC-002 / C139):** Cartesian rule paths emit **`type: "cartesian"` + `marks[]` only** via `planPanelsFromProfile` and vertical rule packs. Use **`createCartesianPanel`** / **`reviseCartesianPanel`** from `@axicharts/charts-spec` for single-panel agent tools. Non-cartesian types (`pie`, `gauge`, `stat`, `candlestick`, etc.) are unchanged.

See [charts-spec/CARTESIAN.md](../charts-spec/CARTESIAN.md).

## Install

```bash
npm install @axicharts/charts-planner @axicharts/charts-spec
```

**Version lockstep:** `@axicharts/charts-planner` peers `@axicharts/charts-spec` at the same **minor** as `@axicharts/charts` (e.g. planner `0.2.x` + spec/charts `0.4.3+`). Install both explicitly — do not rely on a nested spec copy from an older planner release.

| Platform (`@axicharts/charts`) | Planner | Spec peer |
|-------------------------------|---------|-----------|
| `0.4.3+` | `@axicharts/charts-planner@0.2.1+` | `@axicharts/charts-spec@^0.4.3` |

Full matrix: [Version matrix guide](https://axidify.github.io/axicharts/guides/versions).

## Rules + intent planner

```ts
import { DEFAULT_OPS_PROFILE, planFromIntent } from "@axicharts/charts-planner";

const plan = planFromIntent(DEFAULT_OPS_PROFILE, "Line 3 night shift overview");
// → { template: "ops-2x2", layout: "embed", feed: "historian", panels: [...] }
```

### Vertical rule packs (C90)

Beyond C71/C78 color/size/curve inference, vertical packs enrich `PanelSpec` from intent + `DataProfile.fields`:

| Vertical | Examples inferred |
|----------|-------------------|
| **finance** | waterfall for variance/bridge; dual-axis `cartesian` (bar + line marks) for revenue vs margin; `stat` KPI tones; `vsPlan` color fields |
| **trading** | candlestick + `volumeField` + brush/sync hints; RSI follower `cartesian` area mark; `side`/`pnl` color fields |
| **ops** | `alert` panel for alarms; `gauge` thresholds; SLO `rule` + `band` marks on latency `cartesian`; severity color fields |

```bash
charts-planner plan examples/finance.profile.json --intent "P&L variance waterfall"
charts-planner plan examples/trading.profile.json --intent "Trading blotter candlestick with volume"
```

Profile examples: `examples/finance.profile.json`, `examples/trading.profile.json`, `examples/ops.profile.json`.

CSV sample for Path 2: `examples/sample-weekly.csv` — see [CSV dashboard guide](https://axidify.github.io/axicharts/guides/csv-dashboard).

## Planner feeds

`inferFeed()` maps intent keywords to `DashboardPlan.feed`. Each feed binds to a shipped import
gallery fixture — same presets surfaced in Dashboarder **Plan** and the
[runtime import gallery](https://axidify.github.io/axicharts/runtime/import#planner-feeds).

| Feed | Sample intent | Gallery preset |
|------|---------------|----------------|
| `static` | Static CSV snapshot batch report | `ops-embed` |
| `historian` | Line 3 night shift live telemetry | `ops-historian` |
| `rest` | REST API polling /api/metrics endpoint | `ops-rest` |
| `websocket` | WebSocket push feed trading desk | `ops-websocket` |
| `mqtt` | MQTT plant floor sparkplug telemetry | `ops-mqtt` |
| `mock-live` | Mock-live synthetic demo drift sandbox | `ops-mock-live` |

Mosaic intents surface multiple fixtures (wall + feed bind) via `plannerAdapterFixtures()` in
`@axicharts/charts-runtime/validation`.

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

## Planner track (C33–C43)

Dashboarder share exports include planner `meta` (layout, feed, template, mosaic preset,
presentation). Import restores the same fields — see the
[import gallery planner track notes](https://axidify.github.io/axicharts/runtime/import#planner-track).

| Slice | Shipped |
|-------|---------|
| C33 | PlannerPanel adapter hints, docs RuntimeHubNav |
| C34 | WS/MQTT feed intents, feed gallery deep links |
| C35 | REST feed intent, adapter health strip fixture links |
| C36 | Mock-live feed, mosaic multi-adapter hints |
| C37 | `PLANNER_FEED_ROWS`, import gallery planner index |
| C38 | Runtime planner HTTP docs, FeedIntentGlossary |
| C39 | Start page CLI, EmbedDialog feed hints |
| C40 | ShareDialog meta export, Spec Phase 3 cross-link |
| C41 | ImportDialog meta restore hints, track release notes |
| C42 | Runtime adapters planner feed column, share-import round-trip docs |
| C43 | RuntimeHubNav share-import link, ShareDialog/ImportDialog Storybook fixtures |
