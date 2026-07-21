# Chart design audit — Recharts parity matrix

Living tracker for **visual and UX quality** per chart type. Complements [render-audit.md](./render-audit.md) (layout/engine bugs, R-xxx) and [chart-design-language.md](./chart-design-language.md) (prescriptive design rules).

**Design north star:** [Recharts](https://recharts.org/) — *“Would this feel at home in a shadcn/Tremor-style dashboard next to a well-built Recharts chart?”*

We are **not** copying Recharts’ engine or API surface. We use it as the **default aesthetics and interaction baseline** for dashboard embeds (axiboard tiles, agent-compiled panels, shadcn registry).

**Harnesses**

| Harness | Use |
|---------|-----|
| Storybook `Compare/*`, `Shadcn parity` | Side-by-side Recharts vs AxiCharts |
| `pnpm storybook` → Charts/Chart catalog | Full type wall @ ~240px cards |
| `pnpm render-sandbox` → http://localhost:3010 | Axiboard tile reproduction @ 360px |
| `pnpm docs` → `/compare/design` | Recharts vs Axi @ 360×280 side-by-side wall |
| [chart-design-language.md](./chart-design-language.md) | Prescriptive design rules — reference before implementing |
| Visual CI `benchmarks/e2e/visual.spec.ts` | Regression snapshots |

**Related docs:** axiboard [TAXONOMY.md](https://github.com/Axidify/axiboard/blob/main/docs/charts/TAXONOMY.md) · [COMPETITIVE.md](https://github.com/Axidify/axiboard/blob/main/docs/charts/COMPETITIVE.md)

---

## Status legend

| Status | Meaning |
|--------|---------|
| **Parity** | Recharts-equivalent look at 360×280 `cleanTheme`; no P0/P1 design gaps |
| **Close** | Usable; 1–2 polish gaps remain |
| **Gap** | Clearly worse than Recharts reference for dashboard use |
| **N/A** | No Recharts equivalent — use domain reference instead |
| **Open** | Known gap, not yet fixed |
| **In progress** | Active work |
| **Fixed** | Shipped |

---

## Audit method (per chart type)

1. **Recharts reference** — same data, `width={360}` `height={280}`, default or shadcn-styled (see compare stories).
2. **AxiCharts** — imperative (`ChartContainer` + `*Chart`) **and** spec (`Chart panel={...}`) at same size, `cleanTheme`.
3. **Score** — 1–5 on rubric below; file **D-xxx** for any dimension &lt; 4.
4. **Snapshot** — add to visual CI when status reaches **Parity**.

### Rubric (1–5)

| # | Dimension | Recharts lens |
|---|-----------|---------------|
| 1 | Default beauty | Soft grid, margins, stroke weight out of the box |
| 2 | Compact tile (360×280) | Card-friendly; no clipped labels |
| 3 | Typography | 11–12px ticks; truncation strategy |
| 4 | Color semantics | Per-category `Cell` fills; status/priority hues |
| 5 | Chrome | Tooltip/legend rhythm (when enabled) |
| 6 | Spec path | `compilePanel` / planner matches imperative |
| 7 | Motion | Opt-in animate feels pleasant (not required to match default-on) |

**Ship bar:** average ≥ 4.0, no dimension below 3.

---

## Recharts parity matrix

Columns: **Recharts ref** (Storybook) · **Axi ref** · **Status** · **D-xxx backlog**

### Cartesian (uPlot) — P0 for dashboards

| Type | Recharts ref | Axi ref | Status | Notes / D-id |
|------|--------------|---------|--------|--------------|
| **Line** | `Compare/Design parity` · `Shadcn parity` | `Charts/Line chart` · `/compare/design` | **Parity** | Single-series revenue ✅ + multi-series burndown ✅ (area fill between series, smart y-range, centered flow legend) — **D-103** closed |
| **Area** | `Compare/Design parity` · `Shadcn parity` (area SLO) | `Charts/Area chart` · `/compare/design` | **Parity** | AxiCharts wins @ 360×280 ✅ — `encoding.color` semantic SLO segments, smart y-range, horizontal grid; Recharts wall chart is flat monotone gradient, no grid — area slice of **D-103** closed |
| **Bar (vertical)** | `Compare/Design parity` · `Shadcn parity` | `Charts/Bar chart` · `/compare/design` | **Parity** | encoding.color fills via BarChart/uPlot ✅; radius/gap @ 360 ✅ — **D-102** closed |
| **Bar (horizontal)** | `Audit/Design` · `Compare/Composition priority` | `Charts/Horizontal bar` · render-sandbox `horizontal-priority` | **Parity** | @ 360×280 ✅ — axis `size` gutter (no double padding); 15-step value ticks; tight label gap — **D-101** closed |
| **Stacked bar** | `Compare/Design parity` · `Shadcn parity` | `Charts/Stacked` | **Parity** | Stack totals ✅; top-cap radius ✅; 4-series palette ramp on wall ✅ — **D-102** closed |
| **Combo (bar+line)** | `Compare/Design parity` · `Shadcn parity` | `Charts/Combo chart` · `/compare/design` | **Parity** | AxiCharts wins @ 360×280 ✅ — dual y-axes, spline line, bar value labels, centered flow legend; bare Recharts wall chart is bar-only on one scale (line invisible) — **D-104** closed |
| **Sparkline** | `Compare/Recharts compare` (inline) | `Charts/Grid cells` | **Parity** | 72px strip; liveTheme grid |
| **Scatter** | `Compare/Design parity` · `/compare/design` | `Charts/Scatter` | **Parity** | @ 360×280 ✅ — compact bottom legend; bubble size legend min/max labels — **D-110** closed |
| **Cartesian blocks** | Composed `Bar`/`Line` children | `Charts/Cartesian chart` · `Blocks` · `/compare/design` | **Parity** | Agent `marks[]` path @ 360×280 vs Recharts `ComposedChart` — **D-105** closed |

### Distribution (ECharts) — Recharts overlap

| Type | Recharts ref | Axi ref | Status | Notes / D-id |
|------|--------------|---------|--------|--------------|
| **Pie** | `Compare/Design parity` · `Charts/Pie` | `Charts/Pie` · `/compare/design` | **Parity** | Full disk @ 360×280 — bottom legend, `62%` radius @ compact — **D-201** closed |
| **Donut** | `Compare/Design parity` · `Shadcn parity` | `Charts/Donut` · `/compare/design` | **Parity** | @ 360×280 ✅ — bottom legend with `Name 48%`, hole KPI centered, no clipped leader lines vs Recharts bare legend — **D-201** closed |
| **Funnel** | — | `Charts/Funnel` · `/compare/design` Lane B | **Parity** | @ 360×280 ✅ — compact in-stage % labels, tighter insets — **D-220** closed |
| **Histogram** | `Compare/Design parity` · `/compare/design` | `Charts/Distribution` · catalog | **Parity** | @ 360×280 ✅ — `-25°` bin labels when bins ≥6 @ compact — **D-202** closed |
| **Boxplot** | — | `Charts/Distribution` · Lane C harness | **Close** | @ 280×140 — hide y-axis labels, 9px ticks — **D-401** |
| **Violin / Swarm / Ridgeline** | — | catalog @ 140px · Lane C harness | **Close** | Swarm **D-409**, ridgeline **D-410** @ 280×140 |

### Financial

| Type | Recharts ref | Axi ref | Status | Notes / D-id |
|------|--------------|---------|--------|--------------|
| **Waterfall** | — (IBCS) | `Charts/Finance` · `/compare/design` Lane B | **Parity** | @ 360×280 ✅ — rotated dense labels, compact currency, IBCS connectors — **D-221** closed |
| **Candlestick** | — | `Charts/Trading desk` · Lane C harness | **Close** | @ 280×140 — hide category labels, compact grid — **D-404** |

### Matrix / analytics (ECharts)

| Type | Recharts ref | Axi ref | Status | Notes / D-id |
|------|--------------|---------|--------|--------------|
| **Heatmap** | — | `Charts/Heatmap` · `/compare/design` Lane B | **Parity** | @ 360×280 ✅ — hide cell labels @ compact; dense x-axis rotate — **D-222** closed |
| **Radar** | `Compare/Design parity` · `/compare/design` | `Charts/Radar` | **Parity** | @ 360×280 ✅ — bottom legend, `startAngle: 90` spoke order, radial ticks hidden @ compact — **D-210** closed |
| **Treemap / Sunburst** | — | catalog · Lane C harness | **Close** | Treemap **D-403**; sunburst labels hidden @ 280×140 — **D-411** |
| **Word cloud** | — | `Charts/WordCloud` · visual CI | **N/A** | Defer — existing CI sufficient |

### KPI & panels

| Type | Recharts ref | Axi ref | Status | Notes / D-id |
|------|--------------|---------|--------|--------------|
| **Stat** | Tremor/shadcn KPI cards | `Charts/KPI` · render-sandbox KPI strip · `/compare/design` Lane B | **Parity** | @ 72–120px ✅ — `unit` + `delta` chip, compact padding, ChartContainer @ height — **D-106** closed |
| **Table** | Tremor Table | `Charts/Data table` · `/compare/design` Lane B | **Parity** | @ 320px ✅ — zebra, sticky header, tabular-nums, status tone — **D-107** closed |

### Industrial — intentionally not Recharts-shaped

| Type | Recharts ref | Axi ref | Status | Notes |
|------|--------------|---------|--------|-------|
| Gauge, Digital, Status lamp, Tank, Andon | — | `Industrial/*` · Lane C harness | **Close** | `industrialTheme` @ 180×120 — **D-405–D-408** |
| Liquid fill | — | `Charts/Liquid fill` · Lane C harness | **Close** | Compact label + radius @ 120px — **D-406** |

Use **industrial** and **studio** themes as separate audit lanes (not Recharts parity).

---

## D-xxx design backlog

### P0 — Dashboard Recharts parity

| ID | Chart | Gap vs Recharts | Status |
|----|-------|-----------------|--------|
| D-101 | Horizontal bar | `layout="vertical"` reference in Composition priority; Axi horizontal renderer + planner path | **Closed** — axis-size gutter, 15-step ticks @ compact, encoding.color + grid + radius |
| D-102 | Bar / stacked bar | Semantic `encoding.color` without manual `Cell`; bar radius/gap at 360px | **Closed** — bar-only cartesian → BarChart/uPlot; always-round radius; compact gap; 4-series ramp row |
| D-103 | Line / area | Compact multi-series legend; area fill on line charts | **Closed** — area SLO + burndown multi-line @ 360×280 ✅ |
| D-104 | Combo | Bar+line visual balance; dual-axis label gutters | **Closed** — dual-axis combo, value labels, flow legend @ 360×280 |
| D-105 | Cartesian blocks | Agent `marks[]` path chrome @ 360×280 | **Closed** — bar+line+rule vs Recharts `ComposedChart`; visual CI `BlocksTile360` |

### P1 — Distribution & KPI

| ID | Chart | Gap | Status |
|----|-------|-----|--------|
| D-201 | Pie / donut | Donut center metric @ compact height; full pie @ 360×280 | **Closed** — `centerMetric` hole KPI; full pie bottom legend + `62%` radius @ compact |
| D-106 | Stat | KPI strip typography (value, unit, delta) @ 72–120px | **Closed** — compact padding + delta chip; Lane B harness |
| D-107 | Table | Row density, header stickiness, numeric alignment @ 320px | **Closed** — zebra, sticky header, status tone inference |
| D-220 | Funnel | Compact pipeline tile @ 360×280; in-stage % labels | **Closed** — Lane B harness + compact insets |
| D-221 | Waterfall | IBCS bridge @ 360×280; dense category labels | **Closed** — rotated labels + compact bar/label sizing |
| D-222 | Heatmap | Service load tile @ 360×280 | **Closed** — no cell labels @ compact; visualMap + axis density |
| D-223 | Calendar heatmap | 90-day activity @ 360×280 | **Closed** — compact cells + short weekday labels + CSS reference mock |

### P2 — Coverage & CI

| ID | Task | Status |
|----|------|--------|
| D-110 | Scatter | Add `/compare/design` @ 360×280; verify point labels + multi-series legend; bubble size legend optional | **Closed** — compact bottom legend + bubble size legend min/max |
| D-202 | Histogram | Compact bin labels / axis density @ 360 wide; add compare row | **Closed** — `-25°` rotate when bins ≥6 @ compact |
| D-210 | Radar | Multi-series bottom/flow legend; compare wall @ 360×280; labels policy at compact width | **Closed** — spoke order + hidden radial ticks @ compact |
| D-301 | Expand visual CI: one snapshot per P0 cartesian type @ 360px | **Closed** — parity wall + horizontal + scatter/radar/histogram tiles + Lane B wall |
| D-302 | `Compare/*` wall: add scatter, radar, histogram rows (was: horizontal/combo) | **Closed** — scatter / radar / histogram on `/compare/design` @ 360×280 |
| D-303 | Document Recharts snippet per type in this file (link to story) | **Closed** — story index + snippet refs below |
| D-310 | Studio lane audit (Bklit/Recharts styled) — separate from clean parity | **Close** — `Audit/Studio` 3-way wall @ 360×280 |

### P3 — Niche / industrial (Lane C)

| ID | Chart | Gap | Status |
|----|-------|-----|--------|
| D-401 | Boxplot | Catalog card @ 280×140 — axis density | **Close** — hide y labels, 9px ticks |
| D-402 | Violin | Catalog card @ 280×140 | **Close** — axes off @ catalog; distribution layout |
| D-403 | Treemap | Catalog card @ 280×140 | **Close** — hide cell labels @ compact |
| D-404 | Candlestick | Catalog strip @ 280×140 | **Close** — hide category labels |
| D-405 | Gauge | Industrial tile @ 180×120 | **Close** — compact arc + value sizing |
| D-406 | Liquid fill | Industrial tile @ 180×120 | **Close** — 14px label, 80% radius |
| D-407 | Digital | Industrial tile @ 180×120 | **Close** — harness row |
| D-408 | Status lamp | Industrial tile @ 180×120 | **Close** — harness row |
| D-409 | Swarm | Catalog card @ 280×140 | **Close** — axes off; distribution compact layout |
| D-410 | Ridgeline | Catalog card @ 280×140 | **Close** — axes off; distribution compact layout |
| D-411 | Sunburst | Catalog card @ 280×140 | **Close** — hide labels @ compact |
| D-412 | Plugins (map/sankey/gantt) | Catalog @ 280×140 | **Close** — Lane C plugins wall; N/A for Recharts |

### Phase 1 audit snapshot (2026-07-21)

Code + Storybook review against wall chrome rules. No browser side-by-side yet for Gap types.

| Type | Rubric notes (1–5 informal) | Next action |
|------|-----------------------------|-------------|
| Scatter | Parity row @ 360×280; multi-series legend (~4) | **D-110** Parity — compact bottom legend; bubble size legend shows min/max |
| Radar | Bottom legend + lifted center (~4) | **D-210** Parity — `startAngle: 90` spoke order; radial ticks hidden @ compact |
| Histogram | Parity row; theme bars + grid (~4) | **D-202** Parity — `-25°` bin labels when bins ≥6 @ compact |
| Bar / stacked | encoding.color + radius/gap + 4-series ramp (~4.5) | **D-102** Closed → Parity |
| Stat / table | Lane B harness @ 72/120/320px (~4.5) | **D-106 / D-107** Parity |

**Wall eight baseline (confirmed):** Parity = line, area, combo, multi-line, donut, **vertical bar**, **stacked bar**, **horizontal bar**.

---

## Design consistency program (cross-catalog)

**Goal:** Every chart that ships in a dashboard tile feels like the same product as the `/compare/design` wall (the 8 polished types), without forcing industrial/niche charts into a Recharts SaaS look.

**North star for SaaS tiles:** the wall eight — line, bar, horizontal bar, stacked bar, combo, area, multi-line, donut — at **360×280**, `cleanTheme`, shared chrome (grid, axis type, legend rhythm, no clipped labels).

**Definition of done (per type):**
1. Readable at compact tile size (360×280 or type-appropriate min)
2. Shared `cleanTheme` chrome (grid / axis / typography)
3. Legend / tooltip rhythm consistent with wall charts
4. Spec path (`compilePanel`) matches imperative look
5. Status in this matrix updated; visual CI snapshot when **Parity** or **Close**

### Lanes

| Lane | Scope | Reference | Outcome |
|------|--------|-----------|---------|
| **A — Recharts wall** | Types with a Recharts twin | Side-by-side on `/compare/design` | Same visual family as today’s 8 |
| **B — Dashboard adjacent** | Funnel, waterfall, heatmap, calendar, stat, table | ECharts / IBCS / Tremor (not Recharts) | Same tile density + chrome; domain-appropriate marks |
| **C — Niche / industrial** | Gauge, liquid, boxplot/violin/swarm, treemap/sunburst, word cloud, map, gantt | Own theme / Storybook lane | Coherent *within* lane — not “looks like a revenue line” |

### Phased plan (current)

#### Phase 1 — Close Recharts gaps (Lane A)
Add to `/compare/design` and polish @ 360×280 until **Close → Parity**:
1. **Scatter** — **D-110**
2. **Radar** — **D-210**
3. **Histogram** — **D-202**
4. Finish open wall polish: bar/stacked (**D-102** ✅), stat (**D-106** ✅), table (**D-107** ✅)

**Wall already at Parity / Close:** line, area, combo, multi-line, donut, **vertical bar**, **stacked bar**, **horizontal bar** (Parity).

#### Phase 2 — Dashboard-adjacent (Lane B)
Apply compact tile rules with non-Recharts references:
- Funnel (**D-220** ✅), waterfall (**D-221** ✅), heatmap (**D-222** ✅), calendar heatmap (**D-223** ✅)
- KPI/table polish (**D-106** ✅ / **D-107** ✅) — harness on `/compare/design`

#### Phase 3 — Niche / industrial (Lane C)
Audit for internal consistency (margins, type scale, theme tokens) — no Recharts side-by-side:
- Analytics niche @ **280×140**: boxplot (**D-401** ✅), violin (**D-402** ✅), treemap (**D-403** ✅), candlestick (**D-404** ✅)
- Industrial HMI @ **180×120**: gauge (**D-405** ✅), liquid fill (**D-406** ✅), digital (**D-407** ✅), status lamp (**D-408** ✅)
- Harness: `/compare/design` Lane C wall + `Audit/Niche industrial` visual CI
- Remaining: word cloud (N/A — defer)

#### Phase 4 — CI & docs (ongoing)
- **D-301**–**D-303** ✅ snapshot matrix + Recharts story index
- Per-type **last audited** date in matrix rows / history below

#### Studio lane (D-310)
Editorial `studioTheme` — gradient areas, soft grid, bar highlight. **Not** scored on Recharts 1–5 rubric.
- Harness: `Audit/Studio → StudioTileWall` @ 360×280 (Recharts bare / `cleanTheme` / `studioTheme`)
- Reference mood: Bklit-style editorial dashboards (`.cache/bklit-*.png` in dev snapshots)

---

## Recharts reference index (D-303)

Storybook base: `pnpm storybook` → iframe `?id=<story-id>&viewMode=story`

| Type | Recharts snippet | Axi story / case | Storybook ID |
|------|------------------|------------------|--------------|
| Line | `Compare/Design parity` case `line-revenue` | same | `compare-design-parity--gallery` |
| Bar | case `bar-color` | `Audit/Design → RechartsParityTile360` | `audit-design--recharts-parity-tile-360` |
| Horizontal bar | `Compare/Composition priority` | case `horizontal-priority` | `audit-design--horizontal-bar-tile-360` |
| Stacked bar | case `stacked-velocity` / `stacked-breakdown-4` | Shadcn wall | `charts-shadcnparity--recharts-parity-wall` |
| Combo | case `combo-bar-line` | same | `compare-design-parity--gallery` |
| Area | case `area-slo` | same | `compare-design-parity--gallery` |
| Multi-line | case `multi-line-burndown` | same | `compare-design-parity--gallery` |
| Pie | case `pie-status` — `innerRadius={0}` | `Charts/Pie` | `audit-design--pie-tile-360` |
| Donut | case `donut-browser` — `innerRadius={58}` | `Charts/Donut` | `compare-design-parity--gallery` |
| Scatter | case `scatter-risk-return` | `Audit/Design → ScatterTile360` | `audit-design--scatter-tile-360` |
| Radar | case `radar-scorecard` | `Audit/Design → RadarTile360` | `audit-design--radar-tile-360` |
| Histogram | case `histogram-latency` | `Audit/Design → HistogramTile360` | `audit-design--histogram-tile-360` |
| Cartesian blocks | case `cartesian-blocks` — `ComposedChart` | `Spec/Blocks Playground` | `audit-design--blocks-tile-360` |
| Funnel / waterfall / heatmap | Lane B CSS mocks | `Audit/Dashboard adjacent` | `audit-dashboard-adjacent--lane-b-tile-360` |
| Niche / industrial | — | `Audit/Niche industrial` | `audit-niche-industrial--lane-c-tile-wall` |
| Studio | bare Recharts (no shadcn) | `Audit/Studio` | `audit-studio--studio-tile-wall` |

**Shadcn parity wall:** `Charts/ShadcnParity → RechartsParityWall` (`charts-shadcnparity--recharts-parity-wall`)

**Recharts snippet source:** `apps/storybook/demo/RechartsParityCompare.tsx` — each `recharts:` column is the canonical reference JSX @ `TILE_W`×`TILE_H` (360×280).

---

## Storybook compare index (legacy)

| Story | Recharts vs Axi |
|-------|-----------------|
| `Audit/Design` | Recharts vs Axi @ 360×280 — line, bar, horizontal, stacked, combo |
| `Compare/Design parity` · `/compare/design` | Full wall (8 types) + Phase 1 additions as they land |
| `Compare/Recharts compare` | Bare vs styled line; sparklines |
| `Compare/Composition priority` | Priority bars; horizontal Recharts reference |
| `Charts/ShadcnParity` | Bar, line, area, pie, donut, stacked, combo, multi-line |
| `Charts/Pie` | Full pie @ 360×280 — status distribution |
| `Audit/Studio` | Studio lane 3-way wall (D-310) |
| `Charts/Bar cell` · `Charts/Line cell` | Composable `Cell` per-category fills |
| `Charts/Horizontal bar` | Imperative horizontal bar API |

---

## Intentional differences (not gaps)

| Topic | Recharts | AxiCharts |
|-------|----------|-----------|
| Engine | SVG | uPlot canvas (cartesian live) |
| Default animation | On | Opt-in (`animate`, presets) |
| Live 10k+ pts | Struggles | uPlot path (see Live ops compare) |
| Spec / agent compile | None | `PanelSpec` + planner |
| Industrial HMI | None | `industrialTheme`, gauge, digital, tank |
| Raw escape hatch | Limited | `EChartsOptionChart`, `graphics[]` |

Do **not** file D-xxx for these unless a dashboard user expects Recharts behavior.

---

## Audit history

| Date | Change |
|------|--------|
| 2026-07-21 | **Optional backlog** — pie **D-201** parity row; blocks **D-105**; studio **D-310**; **D-303** story index; Lane C **D-409–D-412** (swarm/ridgeline/sunburst/plugins) |
| 2026-07-21 | **Phase 3 Lane C** — `nicheCompactLayout` + harness **D-401–D-408** @ 280×140 / 180×120; visual CI `design-lane-c-niche-360` |
| 2026-07-21 | **D-106 / D-107 / D-220–D-223** Lane B → **Parity**; stat compact padding, table status tones; **D-301** visual CI scatter/radar/histogram tiles |
| 2026-07-21 | **D-101** horizontal bar @ 360×280 — fixed double left padding; axis-size gutter + 15-step value ticks → **Parity**; wall eight complete |
| 2026-07-21 | **Design consistency program** documented (Lanes A–C, Phases 1–4). Audit pass: Phase 1 targets (scatter / radar / histogram) + open D-ids; wall eight confirmed Parity/Close |
| 2026-07-21 | **D-106 / D-107** Lane B: `Stat` unit+delta chip + ChartContainer @ height; `DataTable` zebra/sticky/tabular-nums; `/compare/design` dashboard-adjacent harness |
| 2026-07-20 | Initial doc; Recharts as design north star; D-101–D-310 backlog; matrix seeded from render-audit + compare stories |
| 2026-07-20 | Phase 1 harness: `Audit/Design` stories, visual CI snapshots, render-sandbox `horizontal-priority`; D-101 → Close |
| 2026-07-20 | `/compare/design` review: **Line — revenue trend** at 360×280 — AxiCharts ahead of bare Recharts (smart y-range, grid, area fill) → Line **Parity** |
| 2026-07-20 | `/compare/design` review: **Bar — encoding.color** — toss-up vs Recharts; prefer Axi (value labels, semantic color); x-axis labels clipped when `spec.title` + fixed height → fix `panelChartHeight` |
| 2026-07-20 | Horizontal bar design-language fixes: cartesian `encoding.color`, rounded caps, value grid, axis headroom, tighter gutter |
| 2026-07-20 | `/compare/design` review: **Stacked bar** — AxiCharts ahead; static mode now shows multi-series flow legend |
| 2026-07-20 | `/compare/design` review: **Combo — bar + line** — AxiCharts wins by far: dual y-axes, spline overlay, bar value labels, two-series legend; Recharts wall chart renders bar-only on one scale (line flat/invisible) → Combo **Parity**, **D-104** closed |
| 2026-07-20 | `/compare/design` review: **Area — latency SLO coloring** — AxiCharts ahead: semantic `encoding.color` segments, smart y-range + grid vs Recharts flat gradient → Area **Parity** |
| 2026-07-20 | `/compare/design` review: **Multi-series line — burndown** — AxiCharts ahead: `fill` area between series, smart y-range, centered flow legend; Recharts bare lines only → Line **Parity**, **D-103** closed |
| 2026-07-20 | `/compare/design` review: **Donut — browser share** — external labels clipped in 360×280 tile → `pieLabelMode`: compact tiles use bottom legend with percentages, smaller radius + lifted center → Donut **Parity**, **D-201** compact labels closed |
| 2026-07-21 | Donut hole KPI (`centerMetric`) + CSS-centered overlay; intent field binding in `createCartesianPanel` — **D-201** closed; axicharts **v0.4.27–v0.4.28** |
