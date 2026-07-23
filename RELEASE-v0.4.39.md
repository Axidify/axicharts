# Release v0.4.39 — Light instrument-desk chat UX

## Added

- **axiboard** — light analytical chat shell (starter rows, Source Serif 4 + Plus Jakarta Sans, teal accent)
- **charts-runtime** — `KpiFlipCard.css` with light-safe front/back faces

## Changed

- **charts-runtime** — `PanelsDashboard` renders KPI/chart tiles with `theme: "clean"`
- **axiboard** — segmented Chat/Workspace control; light composer + BYOK inputs
- **docs** — version matrix + agent chat install line aligned to `0.4.39`

## Packages

| Package | From | To |
|---------|------|-----|
| `@axicharts/charts` (+ platform siblings) | 0.4.38 | **0.4.39** |
| `@axicharts/charts-canvas` | 0.4.38 | **0.4.39** |
| `@axicharts/charts-echarts` | 0.4.17 | **0.4.18** (peer `^0.4.39`) |
| `@axicharts/charts-planner` | 0.2.5 | **0.2.6** (peer `^0.4.39`) |

Triggered by GitHub release `v0.4.39` → [publish workflow](.github/workflows/publish.yml).
