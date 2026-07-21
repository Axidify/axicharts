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
| **Bar (vertical)** | `Compare/Design parity` · `Shadcn parity` | `Charts/Bar chart` · `/compare/design` | **Close** | Prefer Axi @ 360×280 (value labels, semantic color) ✅; title chrome clipped x-labels — fixed in `panelChartHeight`; radius/gap — **D-102** |
| **Bar (horizontal)** | `Audit/Design` · `Compare/Composition priority` | `Charts/Horizontal bar` · render-sandbox `horizontal-priority` | **Close** | `encoding.color`, grid, radius, value-axis headroom ✅; left gutter polish — **D-101** |
| **Stacked bar** | `Compare/Design parity` · `Shadcn parity` | `Charts/Stacked` | **Close** | Stack totals ✅; static multi-series legend ✅; 4+ series color ramp — **D-102** |
| **Combo (bar+line)** | `Compare/Design parity` · `Shadcn parity` | `Charts/Combo chart` · `/compare/design` | **Parity** | AxiCharts wins @ 360×280 ✅ — dual y-axes, spline line, bar value labels, centered flow legend; bare Recharts wall chart is bar-only on one scale (line invisible) — **D-104** closed |
| **Sparkline** | `Compare/Recharts compare` (inline) | `Charts/Grid cells` | **Parity** | 72px strip; liveTheme grid |
| **Scatter** | Recharts `ScatterChart` (ad hoc) | `Charts/Scatter` | **Gap** | No compare story; bubble legend — **D-110** |
| **Cartesian blocks** | Composed `Bar`/`Line` children | `Charts/Cartesian chart` · `Blocks` | **Close** | Agent path; less design QA than presets — **D-105** |

### Distribution (ECharts) — Recharts overlap

| Type | Recharts ref | Axi ref | Status | Notes / D-id |
|------|--------------|---------|--------|--------------|
| **Pie** | `Compare/Design parity` · `Shadcn parity` | `Charts/Donut` · catalog | **Close** | Large panels: external labels + leader lines; compact tiles use bottom legend — **D-201** center metric ✅ |
| **Donut** | `Compare/Design parity` · `Shadcn parity` | `Charts/Donut` · `/compare/design` | **Parity** | @ 360×280 ✅ — bottom legend with `Name 48%`, hole KPI centered, no clipped leader lines vs Recharts bare legend — **D-201** closed |
| **Funnel** | — | `Charts/Funnel` | **N/A** | No Recharts funnel; use SaaS mockups |
| **Histogram** | Recharts bar (bins) | `Charts/Distribution` | **Gap** | Bin labels compact — **D-202** |
| **Boxplot** | — | `Charts/Distribution` | **N/A** | Nivo/ECharts reference |
| **Violin / Swarm / Ridgeline** | — | catalog @ 120px | **N/A** | Analytics niche; defer |

### Financial

| Type | Recharts ref | Axi ref | Status | Notes / D-id |
|------|--------------|---------|--------|--------------|
| **Waterfall** | — (IBCS) | `Charts/Finance` · ECharts interaction | **N/A** | IBCS connectors; not Recharts-shaped |
| **Candlestick** | — | `Charts/Trading desk` | **N/A** | TradingView/ECharts reference |

### Matrix / analytics (ECharts)

| Type | Recharts ref | Axi ref | Status | Notes / D-id |
|------|--------------|---------|--------|--------------|
| **Heatmap** | — | `Charts/Heatmap` | **N/A** | ECharts reference |
| **Radar** | Recharts `RadarChart` | `Charts/Radar` | **Gap** | No compare wall — **D-210** |
| **Treemap / Sunburst** | — | catalog | **N/A** | Defer |
| **Word cloud** | — | visual CI snapshot | **N/A** | Defer |

### KPI & panels

| Type | Recharts ref | Axi ref | Status | Notes / D-id |
|------|--------------|---------|--------|--------------|
| **Stat** | Tremor/shadcn KPI cards | `Charts/KPI` · render-sandbox KPI strip | **Close** | 72px scale ✅ (R-006); delta chip design — **D-106** |
| **Table** | Tremor Table | `Charts/Data table` | **Close** | Ellipsis ✅ (R-102); zebra/header — **D-107** |

### Industrial — intentionally not Recharts-shaped

| Type | Recharts ref | Axi ref | Status | Notes |
|------|--------------|---------|--------|-------|
| Gauge, Digital, Status lamp, Tank, Andon | — | `Industrial/*` · plugins | **N/A** | `industrialTheme`; ops/HMI lane |
| Liquid fill | — | `Charts/Liquid fill` | **N/A** | ECharts wave gauge |

Use **industrial** and **studio** themes as separate audit lanes (not Recharts parity).

---

## D-xxx design backlog

### P0 — Dashboard Recharts parity

| ID | Chart | Gap vs Recharts | Status |
|----|-------|-----------------|--------|
| D-101 | Horizontal bar | `layout="vertical"` reference in Composition priority; Axi horizontal renderer + planner path | **Close** — color, grid, radius, axis headroom wired |
| D-102 | Bar / stacked bar | Semantic `encoding.color` without manual `Cell`; bar radius/gap at 360px | **Open** |
| D-103 | Line / area | Compact multi-series legend; area fill on line charts | **Closed** — area SLO + burndown multi-line @ 360×280 ✅ |
| D-104 | Combo | Bar+line visual balance; dual-axis label gutters | **Closed** — dual-axis combo, value labels, flow legend @ 360×280 |

### P1 — Distribution & KPI

| ID | Chart | Gap | Status |
|----|-------|-----|--------|
| D-201 | Pie / donut | Donut center metric @ compact height | **Closed** — `centerMetric` hole KPI + CSS-centered overlay; compact bottom legend + % labels @ 360×280 ✅ |
| D-106 | Stat | KPI strip typography (value, unit, delta) @ 72–120px | **Open** |
| D-107 | Table | Row density, header stickiness, numeric alignment @ 320px | **Open** |

### P2 — Coverage & CI

| ID | Task | Status |
|----|------|--------|
| D-301 | Expand visual CI: one snapshot per P0 cartesian type @ 360px | **In progress** — `Audit/Design` parity wall + horizontal tile |
| D-302 | `Compare/*` wall: add horizontal bar, combo, scatter rows | **Open** |
| D-303 | Document Recharts snippet per type in this file (link to story) | **Open** |
| D-310 | Studio lane audit (Bklit/Recharts styled) — separate from clean parity | **Open** |

---

## Storybook compare index

| Story | Recharts vs Axi |
|-------|-----------------|
| `Audit/Design` | Recharts vs Axi @ 360×280 — line, bar, horizontal, stacked, combo |
| `Compare/Recharts compare` | Bare vs styled line; sparklines |
| `Compare/Composition priority` | Priority bars; horizontal Recharts reference |
| `Shadcn parity` | Bar, line, area, pie, donut, stacked, combo, multi-line |
| `Charts/Bar cell` · `Charts/Line cell` | Composable `Cell` per-category fills |
| `Charts/Horizontal bar` | Imperative horizontal bar API |

---

## Phased plan

### Phase 1 — Cartesian Recharts parity (1 week)

- Close **D-101** → **D-104**
- Add visual CI snapshots for horizontal bar, stacked bar @ 360px
- Update `CompositionPriorityCompare` with Axi horizontal column

### Phase 2 — Distribution + KPI (1 week)

- Close **D-201**, **D-106**, **D-107**
- Extend `Shadcn parity` with pie @ 360px tile

### Phase 3 — CI & docs (ongoing)

- **D-301**–**D-303**: snapshot matrix matches this doc’s P0 table
- Per-type **last audited** date in matrix (below)

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
