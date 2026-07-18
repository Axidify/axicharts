# Cartesian building blocks (`@axicharts/charts-spec`)

> **Wedge:** AI agents compose custom charts on the fly — humans edit the same blocks via `ejectPanel`.  
> **Planning:** [RFC-002](https://github.com/Axidify/Dashboarder/blob/main/docs/charts/rfcs/RFC-002-cartesian-building-blocks.md) (Dashboarder repo)

## Mental model

```
Cartesian chart = shell + marks[]

encoding.x  →  shared category/time axis (all rows)
marks[]     →  data marks (bar, line, area) + overlays (rule, band)
compiler    →  SVG (static) or uPlot (live) — authors don't pick
```

Chart types (`LineChart`, `ComboChart`, …) are **bundles of the same blocks**, not separate dialects.

## Canonical panel spec

```json
{
  "specVersion": 1,
  "type": "cartesian",
  "encoding": { "x": { "field": "week", "label": "Week" } },
  "marks": [
    { "mark": "bar", "field": "revenue", "label": "Revenue" },
    { "mark": "line", "field": "target", "label": "Target" },
    { "mark": "rule", "value": 50, "label": "Quota", "tone": "warning" },
    { "mark": "band", "min": 44, "max": 52, "label": "Healthy band", "tone": "success" }
  ],
  "mode": "static",
  "theme": "studio"
}
```

Example fixture: [examples/cartesian-revenue-target.panel.json](./examples/cartesian-revenue-target.panel.json)

## Mark catalog (v1)

| Mark | Role | Required |
|------|------|----------|
| `bar` | Data | `field` |
| `line` | Data | `field` |
| `area` | Data | `field` |
| `rule` | Overlay (reference line) | `value` |
| `band` | Overlay (threshold zone) | `min`, `max` |

JSX uses `dataKey` as an alias for `field`. Legacy `type` on marks is accepted; canonical key is `mark`.

## Human API (Layer 1)

```tsx
import {
  ChartContainer,
  CartesianChart,
  Grid,
  XAxis,
  YAxis,
  Bar,
  Line,
  Rule,
  Band,
} from "@axicharts/charts/cartesian";
import { studioTheme } from "@axicharts/charts-theme";

<ChartContainer theme={studioTheme} mode="static" height={260} width="100%">
  <CartesianChart data={rows}>
    <Grid />
    <XAxis dataKey="week" />
    <YAxis />
    <Bar dataKey="revenue" name="Revenue" />
    <Line dataKey="target" name="Target" type="monotone" />
    <Rule value={50} label="Quota" tone="warning" />
    <Band min={44} max={52} label="Healthy band" tone="success" />
  </CartesianChart>
</ChartContainer>
```

`ejectPanel(spec)` emits the same composable shape by default. Pass `{ style: "imperative" }` for legacy `ComboChart series={[…]}` output.

## Validation (C136)

```ts
import {
  validateCartesianSpec,
  normalizeToCartesian,
  CartesianSpecValidationError,
} from "@axicharts/charts-spec";

const panel = normalizeToCartesian(incoming);
const result = validateCartesianSpec(panel, {
  rows,
  dataProfile: { metrics: [], fields: Object.keys(rows[0] ?? {}) },
});

if (!result.ok) {
  // Agent retry loop — e.g. UNKNOWN_FIELD with suggestion: "revenue"
  console.error(result.errors);
}
```

`compilePanel` validates cartesian/blocks panels by default (`validateCartesian: false` to opt out during migration).

### Error codes

| Code | When |
|------|------|
| `MISSING_DATA_MARK` | No data marks or empty `marks[]` |
| `UNKNOWN_FIELD` | Field not in data / profile (includes `suggestion`) |
| `INVALID_FIELD_TYPE` | Non-numeric values on data mark |
| `EMPTY_DATA` | Zero data rows |
| `INVALID_BAND_RANGE` | `band.min >= band.max` |
| `UNKNOWN_MARK` | Mark not in v1 catalog |
| `DUPLICATE_OVERLAY_CHANNEL` | Warning — `marks[]` + legacy `referenceLines` props |

## Normalization

| Incoming | Normalized to |
|----------|---------------|
| `type: "line"` / `"bar"` / `"area"` | `cartesian` + one data mark |
| `type: "combo"` | `cartesian` + marks from `encoding.y[]` |
| `type: "blocks"` | `cartesian` (deprecated alias) |
| `props.referenceLines` | `rule` marks |

## Composition rules (summary)

- **One shared X** — all data marks use `encoding.x.field`
- **At least one data mark** — overlays alone are invalid
- **Dual-axis** — compiler auto-resolves when magnitude ratio > 3×; per-mark `yAxisId` supported
- **Live custom SVG** — `renderPath` / `renderBar` static only (C133)

Empirical simulation: 24 scenarios in `src/compositionSimulation.ts` — run `pnpm --filter @axicharts/charts-spec test compositionSimulation`.

## Roadmap slices

| Slice | Status | Deliverable |
|-------|--------|-------------|
| C136 | ✅ branch `feat/rfc-002-c136-cartesian` | `validateCartesianSpec`, `normalizeToCartesian`, `type: "cartesian"` |
| C137 | ✅ branch `feat/rfc-002-c136-cartesian` | Public `CartesianChart` shell; composable eject |
| C138 | ✅ branch | Blocks Playground — spec ↔ chart ↔ JSX; presets + agent skill |
| C139 | Planned | `createCartesianPanel` in charts-planner |
| C140 | Planned | `@axicharts/charts-mcp` |

## Blocks Playground (C138)

Three-pane editor exported as `BlocksPlayground` from `@axicharts/charts-spec`:

| Pane | Content |
|------|---------|
| **Spec** | Editable JSON + validation errors/warnings |
| **Chart** | Live `compilePanel` preview |
| **Code** | Composable `ejectPanel` JSX + copy |

```tsx
import { BlocksPlayground } from "@axicharts/charts-spec";

<BlocksPlayground initialPresetId="revenue-target" />
```

- **Storybook:** `Spec/Blocks Playground`
- **Docs site:** `/spec/blocks`
- **Presets:** `examples/playground/*.panel.json`
- **Agent skill:** `agent-skills/cartesian/SKILL.md`

## CLI

```bash
npx @axicharts/charts-spec eject examples/cartesian-revenue-target.panel.json
```

## Related

- [examples/README.md](./examples/README.md) — fixture catalog
- [charts-planner README](../charts-planner/README.md) — server intent → panels
- Storybook: **Spec/Blocks Playground**, **Charts/Blocks**, **Charts/Studio**
