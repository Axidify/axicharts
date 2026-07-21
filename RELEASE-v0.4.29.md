# Release v0.4.29 — Phase 1 design parity (bar, KPI, table)

## Added

- **charts** — `Stat` `unit` + `delta` chip; narrow-cell layout for 4-up KPI strips @ 72px
- **charts** — `DataTable` zebra, sticky header, compact density, tabular-nums
- **charts-spec** — bar-only panels route to `BarChart`/uPlot so `encoding.color` fills render (D-102)
- **charts-canvas** — rounded bar tops + stacked top-cap radius; compact gap/size @ 360px
- **charts-echarts** — radar legend + compact center; histogram dense-bin axis labels
- **docs** — `/compare/design` scatter/radar/histogram parity rows + Lane B KPI/table harness

## Fixed

- **charts** — `BarChart` `forceCanvas` so semantic bar colors and value labels paint on dashboard tiles
- **charts-spec** — boolean semantic color → success/warning for above/below target bars

## Packages

| Package | From | To |
|---------|------|-----|
| `@axicharts/charts` (+ platform siblings) | 0.4.28 | **0.4.29** |
| `@axicharts/charts-echarts` | 0.4.9 | **0.4.10** |
| `@axicharts/charts-planner` | 0.2.2 | **0.2.2** (peer `^0.4.29`) |

Triggered by GitHub release `v0.4.29` → [publish workflow](.github/workflows/publish.yml).
