# Release v0.4.23 — Design parity @ 360×280

## Highlights

Dashboard tile polish from the Recharts design audit: stacked bars, horizontal bars, donuts, legend layout, and a new `/compare/design` review harness.

## Fixed

- **charts-echarts** — Compact donut/pie: bottom legend with percentages, stable hover (no slice scale), crisp flush segment edges
- **charts** — Stacked bars use canvas stacking; flow legend renders below plot without overlapping series labels
- **charts-canvas** — Horizontal bar path: semantic `encoding.color`, rounded caps, value grid, stack totals
- **charts** — `resolveCartesianPlotSize` reserves legend height; centered flow legend in `CartesianChartShell`
- **charts-spec** — `panelChartHeight` reserves 23px for titled panels (fixes clipped x-axis labels)

## Added

- **docs** — `/compare/design` side-by-side Recharts vs AxiCharts wall with feedback UI
- **docs** — `chart-design-language.md`, `chart-design-audit.md`
- **storybook** — `Compare/Design parity`, horizontal bar, design audit stories
- **benchmarks** — Visual snapshots: `design-recharts-parity-360`, `design-horizontal-bar-360`

## Packages

| Package | From | To |
|---------|------|-----|
| `@axicharts/charts` (+ core, full, runtime, spec, theme, canvas) | 0.4.22 | **0.4.23** |
| `@axicharts/charts-echarts` | 0.4.6 | **0.4.7** |
| `@axicharts/charts-planner` | 0.2.2 | **0.2.2** (peer `^0.4.23`) |

Triggered by GitHub release `v0.4.23` → [publish workflow](.github/workflows/publish.yml).
