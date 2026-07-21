# Release v0.4.33 — Lane B Parity + Phase 3 Lane C compact audit

## Added

- **charts-echarts** — `nicheCompactLayout` for Lane C @ 280×140 analytics / 180×120 industrial (**D-401–D-408**)
- **charts-echarts** — boxplot/violin hide Y labels @ catalog; treemap hides cell labels; candlestick hides categories; liquid compact radius/label
- **charts** — gauge compact arc + value sizing @ industrial tiles (**D-405**)
- **storybook** — Lane C `Audit/Niche industrial` harness + visual CI snapshot
- **docs** — `/compare/design` Lane C wall

## Changed

- **charts** — `Stat` compact padding @ 72px strip (**D-106** → Parity)
- **charts** — `DataTable` infers warning tone from status labels (**D-107** → Parity)
- **docs** — Lane B **D-220–D-223** promoted to Parity; scatter/radar/histogram visual CI tiles (**D-301**)

## Packages

| Package | From | To |
|---------|------|-----|
| `@axicharts/charts` (+ platform siblings) | 0.4.32 | **0.4.33** |
| `@axicharts/charts-echarts` | 0.4.12 | **0.4.13** |
| `@axicharts/charts-planner` | 0.2.2 | **0.2.2** (peer `^0.4.33`) |

Triggered by GitHub release `v0.4.33` → [publish workflow](.github/workflows/publish.yml).
