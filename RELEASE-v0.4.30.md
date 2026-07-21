# Release v0.4.30 — Phase 1 polish + drop bundle size gate

## Added

- **charts-echarts** — scatter compact bottom legend; bubble size legend min/max labels
- **charts-echarts** — radar spoke order aligned with Recharts; radial ticks hidden @ compact
- **charts-echarts** — histogram `-25°` bin labels when bins ≥6 @ compact

## Changed

- **CI** — removed `size-limit` bundle budget gate (was blocking `charts-echarts` growth)

## Packages

| Package | From | To |
|---------|------|-----|
| `@axicharts/charts` (+ platform siblings) | 0.4.29 | **0.4.30** |
| `@axicharts/charts-echarts` | 0.4.10 | **0.4.11** |
| `@axicharts/charts-planner` | 0.2.2 | **0.2.2** (peer `^0.4.30`) |

Triggered by GitHub release `v0.4.30` → [publish workflow](.github/workflows/publish.yml).
