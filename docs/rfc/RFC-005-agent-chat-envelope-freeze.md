# RFC-005 — Agent chat envelope & panel spec freeze (pre-0.5)

**Status:** Accepted (frozen at platform `0.4.37`)  
**Audience:** Server adapters (Nest, Express), chat UIs (Next.js), MCP integrators  
**Related:** [Agent chat integration guide](https://axidify.github.io/axicharts/guides/agent-chat-integration) · RFC-004 agent chart families (axiboard)

## Summary

Before AxiCharts `0.5`, we freeze the **integration surface** used by agent/chat products. Internal renderer details may evolve; the shapes below are semver-stable for **minor** releases (`0.4.x`).

## 1. Agent chart envelope (timeline / activity payload)

Integrators SHOULD use this envelope when passing chart payloads from API → client:

```ts
type AgentChartEnvelope = {
  /** Always `1` for the 0.4.x line. Bumped only on major platform releases. */
  specVersion: 1;
  /** Lets chat UIs skip renderers for non-chart outcomes. */
  visualizationHint: "chart" | "table" | "none";
  /** Validated panel JSON — see §2. */
  panel: PanelSpec;
  /** Row array passed to the renderer alongside `panel`. */
  data: Record<string, unknown>[];
};
```

### Stability rules

| Field | Rule |
|-------|------|
| `specVersion` | Constant `1` until `1.0.0` platform major. New envelope versions ship alongside migration helpers. |
| `visualizationHint` | Enum frozen; new hints require minor bump + docs. |
| `panel` | Must pass `validatePanel(panel, { rows: data, strict: true })` on the server. |
| `data` | Plain JSON rows; no required wrapper object. |

### Error payloads (non-envelope)

When validation fails, servers SHOULD return structured errors for logs and user hints:

```ts
type AgentChartError = {
  error: "invalid_chart_spec";
  hints: string[]; // from toUserFacingHints(validation.errors)
  codes: string[]; // machine-readable ValidationIssue.code
};
```

## 2. Panel spec families (RFC-004)

Agent-safe panel types frozen for `0.4.x`:

| Family | `panel.type` | Data marks | Renderer |
|--------|--------------|------------|----------|
| Cartesian | `"cartesian"` | `bar`, `line`, `area`, `point` + overlays | uPlot (`@axicharts/charts-spec` / `@axicharts/charts`) |
| Distribution | `"distribution"` | `arc`, `funnel` + chrome (`donut`, `label`, `cell`) | ECharts (`@axicharts/charts-echarts`) |
| Matrix | `"matrix"` | `cell`, `colorScale` + axes | uPlot / canvas |

### Cartesian contract (frozen)

- `encoding.x.field` required (category / time axis).
- `marks[]` required; at least one data mark (`bar` | `line` | `area` | `point`).
- Legacy `type: "line"` / `type: "bar"` normalize to `cartesian` — do not emit legacy types from new adapters.

### Distribution contract (frozen)

- `encoding.angle.field` (or legacy `encoding.value.field`) required.
- `encoding.color.field` recommended for pie/donut.
- `marks[]` must include exactly one `arc` or `funnel` data mark for agent paths.

### Matrix contract (frozen)

- `encoding.x.field`, `encoding.y.field`, `encoding.value.field` (or color scale) required.
- `marks[]` includes `cell` + `colorScale`.

## 3. Tabular planner outputs

`planDashboardFromRows` from `@axicharts/charts-planner/tabular` returns:

- `kpis[]` / `charts[]` blocks with `panel`, `rows`, `validationIssues`, `decision`.
- Pie/donut intents on the generic (L4b) path emit `type: "distribution"` panels (`0.4.36+`).

Server chat products typically take **one** `charts[n]` block and wrap it in §1 envelope — they do not expose raw planner JSON to the model.

## 4. Node / CJS packaging (frozen at 0.4.37)

| Entry | ESM | CJS |
|-------|-----|-----|
| `@axicharts/charts-planner/tabular` | `dist/entry/tabular.js` | `dist/entry/tabular.cjs` (bundled, self-contained) |
| `@axicharts/charts-planner` (full) | `dist/index.js` | Not supported — browser / ESM only |
| `@axicharts/charts-spec/planning` | `dist/entry/planning.js` | Not shipped — use planner `/tabular` CJS bundle |

NestJS (CJS compile) MAY use:

```ts
import { planDashboardFromRows } from "@axicharts/charts-planner/tabular";
// or
const { planDashboardFromRows } = require("@axicharts/charts-planner/tabular");
```

## 5. Version alignment (tested combos)

| charts-spec | charts-echarts | charts-planner | Notes |
|-------------|----------------|----------------|-------|
| `0.4.37` | `0.4.16` | `0.2.5` | Peer enforced on echarts → spec minor |

Platform lockstep packages share one minor (`@axicharts/charts`, `charts-spec`, `charts-theme`, `charts-runtime`, `charts-full`, `charts-canvas`, `charts-core`).

## 6. Breaking change policy for 0.5

The following require a **major** or explicit migration guide:

- Renaming / removing envelope fields.
- Removing mark types from agent catalogs.
- Changing `specVersion` default without dual-read period.
- Merging cartesian + distribution into a single `panel.type` (orchestration-layer `chartStyle` may be added in 0.5 without removing families).

## 7. Non-goals (0.4.x)

- Model-authored `encoding` / `marks[]` for covered domain tools (adapters remain server-side).
- Unified single renderer for pie + cartesian.
- MCP as required dependency for production chat.
