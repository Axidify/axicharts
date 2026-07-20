# Release v0.4.21 — Dashboard card layout + empty state + bar config colors

## Fixed

- **charts** — Legend flows below the plot; `ChartContainer` `minHeight` is the plot budget (multi-series cards no longer shrink canvas vs single-series neighbors)
- **charts** — All-zero line/bar/combo/cartesian series render built-in empty UI (`emptyMessage` on `ChartContainer`)
- **charts** — `ChartContainer` `config` keyed by category label colors individual bars for single-series categorical charts

## Added

- **docs** — Troubleshooting: dashboard card grids (`minHeight`, `legendVariant`, `emptyMessage`)

## Packages

| Package | From | To |
|---------|------|-----|
| `@axicharts/charts` (+ platform siblings) | 0.4.20 | **0.4.21** |
| `@axicharts/charts-planner` | 0.2.2 | **0.2.2** (peer `^0.4.21`) |

Triggered by GitHub release `v0.4.21` → [publish workflow](.github/workflows/publish.yml).
