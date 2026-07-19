# Release v0.4.20 — Render audit fixes + dashboard embed polish

## Fixed

- **charts-canvas** — Stacked bar `showValues` renders stack totals (`stackBarTotals`); wider bars at 9–12 categories; `overflow: visible` on uPlot roots
- **charts** — Compact-mode legend height parity (bar/combo/cartesian); dual-axis right inset; KPI font scaling; table cell ellipsis; `ComboPlot` compact destructure regression
- **charts-echarts** — `isCompactTile` tighter grid margins for dashboard tiles (~360px)
- **charts-spec** — `resolvePanelHeight` minimums; `digital` / `status-lamp` compile paths; auto-register `tank` / `andon` plugins

## Added

- **render-sandbox** — Stacked bar totals, pie @ 360px, tank + andon scenarios
- **Storybook** — `Audit/Render` stories for visual CI (IoT grid, pie tile, stacked totals, industrial primitives)
- **docs** — `render-audit.md` living tracker (all R-001–R-204 marked fixed)

## Packages

| Package | From | To |
|---------|------|-----|
| `@axicharts/charts` (+ platform siblings) | 0.4.19 | **0.4.20** |
| `@axicharts/charts-planner` | 0.2.2 | **0.2.2** (peer `^0.4.20`) |

Triggered by GitHub release `v0.4.20` → [publish workflow](.github/workflows/publish.yml).
