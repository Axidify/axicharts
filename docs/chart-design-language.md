# Chart design language

Prescriptive reference for **how AxiCharts should look and behave** in dashboard embeds. Use this when implementing a new chart type, orientation, or compile path — before comparing to Recharts.

**Related docs**

| Doc | Role |
|-----|------|
| [chart-design-audit.md](./chart-design-audit.md) | Recharts parity matrix, D-xxx backlog, review harnesses |
| [render-audit.md](./render-audit.md) | Layout/engine bugs (R-xxx), clipping, scale math |
| `pnpm docs` → `/compare/design` | Side-by-side wall @ 360×280 |

**North star:** *Would this feel at home in a shadcn/Tremor-style dashboard tile next to a well-built Recharts chart?* We are not copying Recharts’ engine — we match its **default dashboard aesthetics** where applicable.

---

## Reference canvas

| Context | Size | Theme | Mode |
|---------|------|-------|------|
| Axiboard tile | **360×280** outer | `cleanTheme` | `static` |
| Plot area (titled panel) | **~257px** chart + **23px** title chrome | same | same |
| KPI / sparkline strip | **72px** height | `cleanTheme` or `liveTheme` | `static` |
| Live ops wall | multi-panel | `liveTheme` | `live` |

**Rule:** Any new renderer or orientation must be reviewed at **360×280** with `cleanTheme` before ship. A feature that only works at 640px is not dashboard-ready.

**Title chrome:** When `PanelSpec.title` is set, `panelChartHeight()` reserves **23px** for the uppercase title row + gap. The outer height is the tile budget; the chart plot must shrink — never clip axis labels.

---

## Themes

### `cleanTheme` — default dashboard lane

Source: `packages/charts-theme/src/themes.ts`

| Token | Value | Intent |
|-------|-------|--------|
| Grid | horizontal only, opacity **0.42** | Soft guides; never heavy cross-hatch |
| Line | stroke **2.25**, curve **monotone** | Smooth trend lines |
| Area | fill opacity **0.24** | Readable gradient under line |
| Bar | radius **5**, gap **0.28** | Rounded caps; even spacing |
| Axis | shown | Tick labels always readable |
| Values | sans-serif | Dashboard default |

### Other lanes (not Recharts parity)

| Theme | Use |
|-------|-----|
| `liveTheme` | Dark ops walls, monospace values, denser grid |
| `industrialTheme` | HMI / gauge / tank — separate audit lane |
| `studioTheme` | Editorial polish — gradient areas, glow |
| `presentationTheme` | Decks / large format |

Do **not** judge `live` or `industrial` against Recharts. Judge `clean` @ 360×280.

---

## Typography

| Element | Spec |
|---------|------|
| Axis ticks | **11px** `ui-sans-serif` (values may use monospace in `liveTheme`) |
| Panel title | **11px**, weight 600, `letter-spacing: 0.04em`, uppercase, `#64748b` |
| Value labels (`showValues`) | **10px**, same family |
| Truncation | Ellipsis when slot width is tight — never hard clip (see R-102 patterns) |

---

## Color semantics

Dashboard charts should communicate meaning through color without manual per-row JSX.

### 1. `encoding.color` (spec path)

Every compile path (`type: "bar"`, `type: "line"`, `type: "cartesian"`, horizontal **and** vertical) must wire `encoding.color` → series `fills[]`.

```json
"encoding": {
  "color": { "field": "aboveTarget", "type": "semantic" }
}
```

| `type` | Resolution |
|--------|------------|
| `semantic` | boolean / tone → success vs warning palette |
| `nominal` | per-category color from label rules or palette |

**Implementation:** `fillsFromColorField()` in `packages/charts-spec/src/colorEncoding.ts`.

### 2. Nominal label rules (priority, status, stage)

Source: `packages/charts-spec/src/nominalColorMap.ts`

| Pattern | Color | Example |
|---------|-------|---------|
| P1 / critical / urgent | `#f43f5e` | P1 – Critical |
| P2 / high | `#f59e0b` | P2 – High |
| P3 / medium | `#3b82f6` | P3 – Medium |
| P4 / low | `#64748b` | P4 – Low |
| done / resolved | `#16a34a` | Closed |

When `encoding.color.field` matches priority/status dimensions, these colors apply automatically.

### 3. Default series palette

When no semantic rule matches, cycle `SERIES_PALETTE` in `colorEncoding.ts` — never fall back to a single blue for all categories.

### 4. Anti-pattern

> Four bars, one `#2563eb` fill, when `encoding.color` is present on the spec.

This is a **compile/renderer bug**, not a design choice.

---

## Cartesian chrome

Applies to line, area, bar, combo — **all orientations**.

| Element | Rule |
|---------|------|
| Grid | Horizontal value-grid on; vertical grid off (unless dual-axis live) |
| Axis spines | Visible or implied — labels must anchor to an axis rhythm |
| Value axis range | Smart range with ~12% headroom above max; avoid flat lines from 0-baseline when data is narrow |
| Category axis | Bottom (vertical) or left (horizontal); size from `categoryAxisSize()` / `categoryAxisSizeForLabels()` |
| Padding | `categoryChartPadding()` / `horizontalBarChartPadding()` — edge labels must not clip |
| Legend | Below plot when multi-series in `static` mode; height reserved via chrome insets (`legendVariant: "inline"` at 360px) |
| Tooltip | Minimal variant default on dashboard panels |

### Vertical bar (reference)

What “good” looks like @ 360×280 (throughput bar):

- Semantic green/red per bar via `encoding.color`
- `showValues` above bars with suffix (`req/min`)
- Soft horizontal grid
- Rounded bar tops (`theme.bar.radius`)
- Category labels fully visible below plot

### Horizontal bar (must match vertical language)

Horizontal is a **layout variant**, not a separate aesthetic. Same rules:

| Dimension | Required |
|-----------|----------|
| `encoding.color` | Per-category fills (P1–P4 hues) |
| Bar radius | Rounded end cap (`theme.bar.radius`, trailing edge) |
| Grid | Value-axis grid lines (horizontal bars → vertical grid on value scale) |
| Left gutter | Tight label-to-bar proximity; no dead whitespace |
| Value axis | Headroom past longest bar; ticks readable |
| Annotations | Deferred — but chrome/color/radius are not |

**Regression example (D-101):** Horizontal path shipped with geometry only — monochrome bars, no grid, square caps, loose gutter. Failed this doc.

---

## Bar chart

| Property | Default | Notes |
|----------|---------|-------|
| Orientation | `vertical` | `horizontal` when category cardinality > 12 or long labels |
| `showValues` | opt-in via `props.showValues` | Reserves top (vertical) or right (horizontal) padding |
| Stack totals | on when `stacked` + `showValues` | See `stackBarTotals` |
| Gap | theme `bar.gap` → `ordinalBarGapPx()` | Wider bars for ≤4 categories |
| Radius | theme `bar.radius` | Custom draw path when per-bar `fills[]` set |

---

## Line & area

| Property | Default |
|----------|---------|
| Curve | monotone |
| Area fill | on for `type: "area"` and revenue-style line panels |
| Dots | off at dashboard sizes |
| Multi-series | inline legend when ≤3 series; compact policy for 4+ (D-103) |

**Advantage over bare Recharts:** smart y-range + area fill + grid out of the box (see Line parity @ `/compare/design`).

---

## Combo (bar + line)

| Rule | Intent |
|------|--------|
| Bar visual weight ≤ line emphasis | Line should read as overlay, not afterthought |
| Dual-axis gutters | Both y-axes labeled; no overlap at 360px (D-104) |
| Legend | Required when series names differ |

---

## Distribution (pie / donut)

| Rule | Intent |
|------|--------|
| Legend | Beside or below; never overlap slice labels at 360px |
| Donut center | Optional metric — keep readable at compact height (D-201) |
| Colors | Palette or `encoding.color`; match nominal rules when dimension is status/priority |

---

## Interaction & hover

Prescriptive rules for **tooltip, crosshair, and visual emphasis** across chart families. Audited in [chart-design-audit.md](./chart-design-audit.md) (**D-5xx** backlog). Harness: Storybook `Charts/Interaction`.

**North star:** In `interactive` / `presentation` mode, every chart type uses the same *interaction language* — highlight what is active, dim what is not, show values in the shared React `Tooltip`. We do **not** require identical mechanics (crosshair on pies, slice scale on bars).

### Mode matrix

Source: `packages/charts/src/interaction/mode.ts` → `getInteractionChrome()`.

| Mode | Tooltip | Crosshair | Visual emphasis | Typical context |
|------|---------|-----------|-----------------|-----------------|
| `static` | off | off | off | Axiboard tiles @ 360×280 — **intentional** |
| `live` | off | on | optional band | Ops walls, streaming panels |
| `interactive` | on | on | on (per pattern below) | Exploratory dashboards, docs |
| `presentation` | on | on | on (stronger item pop) | Decks, large-format demos |

**Rule:** Do not enable hover chrome in `static` to “fix” parity gaps. Tiles are embed-first; hover belongs in interactive contexts.

### Two interaction patterns

| Pattern | Charts | Active signal | Inactive signal | Data readout |
|---------|--------|---------------|-----------------|--------------|
| **Category-hover** | Line, area, bar, combo, candlestick, waterfall | Vertical band + crosshair at category index | Dim outside band (target) | React `Tooltip` @ `cursor.index` |
| **Item-hover** | Pie, scatter, treemap, funnel, map, heatmap, … | Emphasize hovered mark | Dim siblings (`~0.72` opacity) | React `Tooltip` via `onItemHover` |

Implementation shells:

- **Category-hover** — `CartesianChartShell` + uPlot `setCursor` hook (`UPlotBar`, `UPlotLine`, `UPlotCombo`) or ECharts `onCursor` (waterfall, candlestick).
- **Item-hover** — `EChartsInteractionShell` + `useEChart` `mouseover` → `ChartInteractionContext.setItemHover`.

Synced panels: `SyncHighlight` renders a category band on any cartesian hover when crosshair is enabled (**D-504**). In a `ChartSyncGroup`, follower charts also dim outside the active band.

### Hover tokens

Source: `packages/charts-theme/src/hover.ts` → `resolveHoverChrome()` / `resolvePluginHoverPalette()` (**D-501**).

| Token | Value | Use |
|-------|-------|-----|
| `dimOpacity` | `0.72` | Inactive marks/regions (map, geo, ECharts blur) |
| `taskDimOpacity` | `0.45` | Gantt task dim |
| `bandColor` | theme-aware `rgba` | Category band fill |
| `bandFollowerBorder` | theme-aware `rgba` | Follower sync band edge |
| `stroke` | `#2563eb` / `#38bdf8` | Active region stroke (light / dark) |
| `scaleSize` | `6` (presentation only) | Pie slice pop — **not** dashboard interactive |
| `shadowBlur` | `10` | Presentation item emphasis |

Shared ECharts helper (**D-502**): `itemEmphasisOptions()` in `packages/charts-echarts/src/themeBridge.ts`.

### Category-hover (cartesian)

| Element | Status |
|---------|--------|
| Crosshair | ✅ `Crosshair` overlay |
| Tooltip | ✅ `Tooltip` @ category index |
| Category band | ✅ `SyncHighlight` on any hover (**D-504**) |
| Bar/line mark pop | ❌ deferred (**D-506**) — canvas draw hooks |

### Item-hover (ECharts + plugins)

| Element | Rule |
|---------|------|
| Tooltip | React overlay; `hiddenTooltip()` on ECharts series |
| Sibling dim | `emphasis.focus: "self"` (or `"adjacency"` / `"ancestor"` where semantically correct) |
| Scale / translate | **Presentation only** for pie; no slice jump on compact tiles |
| Sankey | React overlay via `onItemHover` + `hiddenTooltip()` (**D-505**) |

#### Pie / donut (special case)

Source: `packages/charts-echarts/src/pieLayout.ts` → `pieEmphasisOptions()`.

| Mode | Scale | Sibling dim | Shadow |
|------|-------|-------------|--------|
| `static` | off | off | off |
| `interactive` | off | on | subtle or off |
| `presentation` | on (`scaleSize: 6`) | on (`focus: "self"`) | on |

**Regression guard:** `pieGapOptions.test.ts` — “dashboard donuts stable on hover” means **no scale** outside presentation, not “no hover at all.”

### N/A — no item hover expected

Gauge, digital, status lamp, tank, liquid fill, KPI stat, data table — single-value or non-mark surfaces. Do not force category or item hover.

### New chart checklist (interaction)

Add to the feature checklist below:

8. [ ] Declares **category-hover** or **item-hover** pattern
9. [ ] `interactive` mode: tooltip + emphasis per pattern
10. [ ] `static` mode: no hover chrome (if shipped as tile)
11. [ ] Row in interaction audit matrix ([chart-design-audit.md](./chart-design-audit.md))

---

## Panel spec conventions

```json
{
  "specVersion": 1,
  "type": "bar | cartesian | line | …",
  "theme": "clean",
  "mode": "static",
  "title": "Optional — consumes 23px of tile height",
  "height": 280,
  "encoding": { "x": {}, "y": {}, "color": {} },
  "props": {
    "showValues": true,
    "legendVariant": "inline",
    "tooltipVariant": "minimal",
    "style": { "bar": { "radius": 8, "gap": 0.32 } }
  }
}
```

| Path | Must produce identical visuals |
|------|-------------------------------|
| `compilePanel(spec)` | Agent / axiboard |
| `Chart panel={spec}` | Declarative |
| `ejectPanel` → JSX | Escape hatch with `Cell` fills preserved |
| Imperative `BarChart` + `ChartContainer` | App code |

**Rule:** If `type: "bar"` and `type: "cartesian"` + bar marks diverge in color, radius, or chrome — fix before ship.

---

## New feature checklist

Before merging a new chart type, orientation, or compile route:

1. [ ] Renders at **360×280** `cleanTheme` without clipped labels
2. [ ] `encoding.color` wired (if applicable)
3. [ ] Theme `bar.radius` / `line.strokeWidth` / grid tokens respected
4. [ ] Spec path === imperative path (visual diff)
5. [ ] Row added to [chart-design-audit.md](./chart-design-audit.md) matrix
6. [ ] Snapshot in visual CI when status reaches **Parity**
7. [ ] Compared on `/compare/design` or Storybook `Compare/Design parity`
8. [ ] Interaction pattern declared (category-hover vs item-hover); see **Interaction & hover** above
9. [ ] `interactive` mode: tooltip + emphasis per pattern; `static` tiles remain hoverless
10. [ ] Interaction audit row updated in [chart-design-audit.md](./chart-design-audit.md)

---

## Intentional differences (not bugs)

| Topic | AxiCharts | Recharts |
|-------|-----------|----------|
| Engine | uPlot canvas (cartesian) | SVG |
| Default animation | Off (opt-in) | On |
| Area under line | Default on `cleanTheme` | Opt-in |
| Y-range | Smart zoom on narrow data | Often 0-baseline |
| Live 10k+ pts | uPlot path | Struggles |
| Spec / planner | `PanelSpec` + agent compile | None |

---

## Anti-patterns

| Anti-pattern | Why it fails |
|--------------|--------------|
| Monochrome bars with `encoding.color` on spec | Breaks semantic dashboard language |
| New orientation without grid/radius/color | Reads as prototype, not product |
| Fixed chart height ignoring `spec.title` | Clips axis labels (see `panelChartHeight`) |
| Bare uPlot defaults exposed to users | Bypasses `cleanTheme` polish |
| Vertical bar polish not ported to horizontal | Orientation is layout, not a new chart family |
| Testing only at 640px or in Storybook cards | Misses axiboard tile regressions |

---

## Audit history

| Date | Change |
|------|--------|
| 2026-07-22 | **Interaction & hover** — mode matrix, category vs item patterns, hover tokens, pie rules, D-5xx backlog cross-ref |
| 2026-07-20 | Initial design language doc from `/compare/design` reviews (line win, bar toss-up, horizontal gap) |
