# Release v0.4.22 — Chrome token validation + nominal priority colors

## Fixed

- **charts-theme** — Reject malformed host `--chart-grid` / `--chart-axis` tokens (RGB channels in `hsl()` that canvas rendered as yellow grid / pink axes); explicit `theme.tokens` chrome wins over document CSS
- **charts-canvas** — `chromeGridStroke()` validates grid tokens before uPlot paint; respects theme grid opacity
- **charts** — `ChartContainer` `inheritThemeTokens` prop (default `true`; set `false` to skip host CSS token reads)
- **charts-theme** — Softer `cleanTheme` default grid opacity (0.42)
- **charts-spec** — Nominal priority/status bar colors on spec + planner path (`encoding.color`, `compileRecipe` enrichment)
- **charts-spec** — High-cardinality bar geometry stays vertical until horizontal renderer ships (no false `orientation: "horizontal"`)

## Added

- **charts-theme** — `contrast.ts` utilities (`resolveCanvasRgb`, `looksLikeRgbInHsl`, `sanitizeChromeToken`)
- **charts-spec** — `nominalColorMap` (P1–P4, severity/status label → semantic fill)
- **storybook** — `Compare/Composition priority` repro story (AxiCharts vs Recharts)

## Packages

| Package | From | To |
|---------|------|-----|
| `@axicharts/charts` (+ core, full, runtime, spec, theme) | 0.4.21 | **0.4.22** |
| `@axicharts/charts-canvas` | 0.4.6 | **0.4.22** |
| `@axicharts/charts-planner` | 0.2.2 | **0.2.2** (peer `^0.4.22`) |

Triggered by GitHub release `v0.4.22` → [publish workflow](.github/workflows/publish.yml).
