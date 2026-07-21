# Release v0.4.31 — Phase 2 Lane B compact funnel/waterfall/heatmap/calendar

## Added

- **charts-echarts** — `funnelLayout`, `waterfallLayout`, `heatmapLayout`, `calendarLayout` compact helpers @ 360×280
- **charts-echarts** — funnel `{b}\n{d}%` labels + tighter insets; waterfall rotated labels ≥5 categories; heatmap hides cell labels @ compact; calendar short weekday letters + hides year @ compact
- **docs** — `/compare/design` Lane B rows **D-220–D-223** with CSS reference mocks (GitHub-style calendar grid)

## Packages

| Package | From | To |
|---------|------|-----|
| `@axicharts/charts` (+ platform siblings) | 0.4.30 | **0.4.31** |
| `@axicharts/charts-echarts` | 0.4.11 | **0.4.12** |
| `@axicharts/charts-planner` | 0.2.2 | **0.2.2** (peer `^0.4.31`) |

Triggered by GitHub release `v0.4.31` → [publish workflow](.github/workflows/publish.yml).
