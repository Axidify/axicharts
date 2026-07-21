# Release v0.4.27 — Donut center KPI (D-201) + parity harness

## Added

- **charts-echarts** — Donut center hole KPI via `centerMetric` (`largest`, explicit `{ value, label }`, or `{ slice }`)
- **charts-spec** — `props.centerMetric` on donut/distribution panels; `readPanelCenterMetric` resolver
- **charts** — `PieChart` `centerMetric` prop

## Fixed

- **storybook** — Recharts + Shadcn parity walls share `DONUT_PARITY_SPEC` (360×280, matched colors, no duplicate in-tile title)

## Packages

| Package | From | To |
|---------|------|-----|
| `@axicharts/charts` (+ platform siblings) | 0.4.26 | **0.4.27** |
| `@axicharts/charts-echarts` | 0.4.7 | **0.4.8** |
| `@axicharts/charts-planner` | 0.2.2 | **0.2.2** (peer `^0.4.27`) |

Triggered by GitHub release `v0.4.27` → [publish workflow](.github/workflows/publish.yml).
