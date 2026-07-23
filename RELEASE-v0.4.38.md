# Release v0.4.38 — Phase 5 interaction uniformity (D-501–D-505)

## Added

- **charts-theme** — shared hover tokens (`resolveHoverChrome`, `resolvePluginHoverPalette`, `ChartTheme.hover`)
- **charts-echarts** — `itemEmphasisOptions()` for normalized item-hover emphasis across distribution charts
- **docs** — Phase 5 interaction uniformity; design-language § Interaction & hover

## Changed

- **charts** — `SyncHighlight` renders category band on any cartesian hover when crosshair is enabled (**D-504**)
- **charts-echarts** — pie interactive emphasis dims siblings without slice scale; wired `itemEmphasisOptions` on histogram, boxplot, violin, funnel, radar, ridgeline, swarm, pictorial bar, treemap (**D-502–D-503**)
- **charts-map**, **charts-geo**, **charts-gantt** — plugin hover palette from shared theme tokens (**D-505**)
- **charts-sankey** — React tooltip overlay via `onItemHover`; hidden native ECharts tooltip (**D-505**)

## Packages

| Package | From | To |
|---------|------|-----|
| `@axicharts/charts` (+ platform siblings) | 0.4.37 | **0.4.38** |
| `@axicharts/charts-echarts` | 0.4.16 | **0.4.17** (peer `^0.4.38`) |
| `@axicharts/charts-sankey` | 0.1.0 | **0.1.1** |
| `@axicharts/charts-map` | 0.4.6 | **0.4.7** |
| `@axicharts/charts-geo` | 0.1.0 | **0.1.1** |
| `@axicharts/charts-gantt` | 0.1.0 | **0.1.1** |

Triggered by GitHub release `v0.4.38` → [publish workflow](.github/workflows/publish.yml).
