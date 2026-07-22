# @axicharts/charts-planner

Server-side dashboard planner for AxiCharts. Converts metric profiles and natural-language intent into validated `charts-spec` plans, with rules fallback when LLM output is invalid.

**Cartesian panels (RFC-002 / C139):** Cartesian rule paths emit **`type: "cartesian"` + `marks[]` only** via `planPanelsFromProfile` and vertical rule packs. Use **`createCartesianPanel`** / **`reviseCartesianPanel`** from `@axicharts/charts-spec` for single-panel agent tools. Non-cartesian types (`pie`, `gauge`, `stat`, `candlestick`, etc.) are unchanged.

See [charts-spec/CARTESIAN.md](../charts-spec/CARTESIAN.md).

## Install

```bash
npm install @axicharts/charts-planner @axicharts/charts-spec
```

**Version lockstep:** `@axicharts/charts-planner` peers `@axicharts/charts-spec` at the same **minor** as `@axicharts/charts` (e.g. planner `0.2.4` + spec/charts `0.4.36`). Install both explicitly — do not rely on a nested spec copy from an older planner release.

| Platform (`@axicharts/charts`) | Planner | Spec peer |
|-------------------------------|---------|-----------|
| `0.4.36` | `@axicharts/charts-planner@0.2.4` | `@axicharts/charts-spec@^0.4.36` |
| `0.4.35` | `@axicharts/charts-planner@0.2.3` | `@axicharts/charts-spec@^0.4.35` |
| `0.4.3+` | `@axicharts/charts-planner@0.2.1+` | `@axicharts/charts-spec@^0.4.3` |

Full matrix: [Version matrix guide](https://axidify.github.io/axicharts/guides/versions).

## Server vs browser entry points

`@axicharts/charts-planner` ships **three** npm subpaths. Pick the one that matches your runtime — importing the wrong entry is the most common Node integration failure.

| Entry | Use when | Exports |
|-------|----------|---------|
| `@axicharts/charts-planner/tabular` | **API / Nest / Node** — tabular fallback only | `planDashboardFromRows` |
| `@axicharts/charts-planner/server` | Standalone HTTP planner | `createPlannerServer` |
| `@axicharts/charts-planner` | Browser bundlers, full planner surface | `planFromIntent`, `planWithProvider`, CSV path, … |

### Tabular planner (server-safe)

Use this in API processes and agent chat backends. It imports `@axicharts/charts-spec/planning` only — **no React Chart, no uPlot CSS**.

```ts
import { planDashboardFromRows } from "@axicharts/charts-planner/tabular";

const plan = planDashboardFromRows(rows, { intent: "tasks by status" });
// → { panels: [...], layout, notes }
```

### NestJS / CommonJS consumers

The package is **ESM-only** (`"type": "module"`). NestJS apps compiled to CommonJS cannot use a static `import` of `./tabular` — Node will throw `ERR_PACKAGE_PATH_NOT_EXPORTED` or fail to resolve `require()`.

**Supported pattern today:** dynamic `import()` inside an async helper:

```ts
// apps/api — NestJS service (compiled to CJS)
async function planFromTabularRows(
  rows: Record<string, unknown>[],
  intent: string,
) {
  const { planDashboardFromRows } = await import("@axicharts/charts-planner/tabular");
  return planDashboardFromRows(rows, { intent });
}
```

Alternatively, compile the API to ESM (`"module": "NodeNext"` in `tsconfig`) so static imports work.

### Main entry (browser / full planner)

The default export re-exports through the main `@axicharts/charts-spec` barrel, which pulls React Chart and uPlot CSS. **Do not import the main entry in server-only processes.**

```ts
// ✅ Browser / Vite / Next client components
import { planFromIntent } from "@axicharts/charts-planner";

// ❌ Nest API / Node scripts — use ./tabular instead
import { planFromIntent } from "@axicharts/charts-planner";
```

### HTTP server entry

```ts
import { createPlannerServer } from "@axicharts/charts-planner/server";

const server = createPlannerServer({ port: 3921 });
```

Or use the CLI: `charts-planner serve --port 3921` (see [HTTP server](#http-server) below).

### Jest / CJS test runners

When testing adapters that call the tabular planner, prefer **mocking at the adapter boundary**. If you need real resolution, add `moduleNameMapper` entries — see [Agent chat integration guide](https://axidify.github.io/axicharts/guides/agent-chat-integration#jest--cjs-test-runners).

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
gallery fixture — same presets surfaced in Axiboard **Plan** and the
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

Axiboard share exports include planner `meta` (layout, feed, template, mosaic preset,
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
