# Chart rendering audit

Living tracker for axicharts render quality — especially compact dashboard embeds (axiboard `PanelsDashboard`).

**Harness:** `pnpm render-sandbox` → http://localhost:3010

**Backlog issue:** [axicharts#9](https://github.com/Axidify/axicharts/issues/9)

## Status legend

| Status | Meaning |
|--------|---------|
| **Fixed** | Shipped in repo |
| **Open** | Known issue, not yet fixed |
| **Tracked** | GitHub issue filed |

---

## P0 — Dashboard embed blockers

| ID | Issue | Renderer | Status | Notes |
|----|-------|----------|--------|-------|
| R-001 | Categorical bars pinned to edges / thin / labels clipped | uPlot bar/combo | **Fixed** | v0.4.19 `categoricalScale` |
| R-002 | Bar charts lack compact mode (`height < 72`) | uPlot bar | **Fixed** | Parity with `LineChart` |
| R-003 | Combo/cartesian legend height subtracted when legend hidden | charts shell | **Fixed** | `showLegend && !compact` |
| R-004 | Dual-axis overlay insets on wrong side (left vs right) | overlays | **Fixed** | `cartesianPlotInsets` |
| R-005 | `showValues` labels clipped above bars | uPlot bar/combo | **Fixed** | Extra top padding when enabled |
| R-006 | Stat KPIs overflow at 72px height | Stat | **Fixed** | Responsive font scaling |
| R-007 | `overflow: hidden` on all cartesian roots | uPlot + shell | **Fixed** | `overflow: visible` on plot roots |

## P1 — Important polish

| ID | Issue | Renderer | Status |
|----|-------|----------|--------|
| R-101 | Thin bars at 9+ categories | uPlot | **Fixed** | Wider `ordinalBarSize` for 9–12 categories |
| R-102 | Table cells `nowrap` without ellipsis | DataTable | **Fixed** | `table-layout: fixed` + ellipsis |
| R-103 | ECharts types untested at 360px tiles | ECharts | **Fixed** | `isCompactTile` grid margins |
| R-104 | Stacked bars silently drop `showValues` | uPlot | **Fixed** | `stackBarTotals` |
| R-105 | Fixed default heights (240/280) with no plot-area minimum | compilePanel | **Fixed** | `resolvePanelHeight` |

## P2 — Architecture / coverage

| ID | Issue | Status |
|----|-------|--------|
| R-201 | `Digital` / `StatusLamp` — no `compilePanel` path | **Fixed** | `digital` + `status-lamp` cases |
| R-202 | `tank` / `andon` require manual register import | **Fixed** | Auto-register in `registerPluginChartTypes` |
| R-203 | Visual CI covers 8 Storybook stories only | **Fixed** | `RenderAudit.stories` + 4 snapshots |
| R-204 | Plugin charts (geo, map, gantt) — no compact scenarios | **Fixed** | render-sandbox `plugin-industrial` + pie tile |

---

## Render sandbox scenarios

| Scenario | Exercises |
|----------|-----------|
| Two categories | Sparse ordinal bars |
| Four device IDs | Short labels in 360px tile |
| Long category labels | Ellipsis |
| Twelve months | High cardinality |
| Single category | Centering edge case |
| IoT telemetry grid | Full 2×2 axiboard reproduction |
| Bar + line combo | Mixed marks |
| Dual-axis combo | Right y2 + overlay insets |
| Bar value labels | `showValues` top padding |
| Compact bar (60px) | Sparkline height |
| KPI stat strip (72px) | PanelsDashboard KPI row |
| Stacked bar totals | `showValues` on stacked bars |
| Pie at 360px | ECharts compact margins |
| Tank + andon | Plugin auto-register |
| Table panel (320px) | Register table height |

---

## Renderer matrix (quick reference)

| Engine | Types | Risk focus |
|--------|-------|------------|
| uPlot | line, bar, combo, cartesian, navigator | Compact layout, labels, dual axis |
| ECharts | pie, scatter, heatmap, financial, … | Grid margins at small width |
| React | stat, table, alert, markdown | Fixed typography |
| SVG plugins | gauge, geo, map, gantt, tank, andon | No shared compact contract |

---

## Audit history

- **2026-07-19** — Initial audit; v0.4.19 categorical fix; render-sandbox added
- **2026-07-19** — P0 compact-mode parity + dual-axis insets + stat scaling
- **2026-07-20** — All P0–P2 audit items fixed; RenderAudit visual CI + sandbox expansion
