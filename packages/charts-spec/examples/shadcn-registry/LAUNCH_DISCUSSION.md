# GitHub Discussion draft — AxiCharts v0.3.21

> **Posted** in GTM-5: https://github.com/Axidify/axicharts/discussions/1

**Category:** Announcements  
**Title:** AxiCharts v0.3.21 — shadcn registry CI + stacked bar block

---

## Summary

We shipped **registry E2E in CI** (`pnpm test:registry`) so every release validates the shadcn custom registry and dry-runs `shadcn add` against our hosted catalog. Two new registry items: **stacked bar** and a **chartConfig lib** helper.

## Install

```bash
npm install @axicharts/charts @axicharts/charts-theme echarts uplot
```

**shadcn custom registry:**

```bash
npx shadcn@latest add https://axidify.github.io/axicharts/registry/chart-axi-bar.json
npx shadcn@latest add https://axidify.github.io/axicharts/registry/chart-axi-stacked-bar.json
npx shadcn@latest add https://axidify.github.io/axicharts/registry/chart-axi-chart-config.json
```

## Links

| Asset | URL |
|-------|-----|
| shadcn migration gallery | https://axidify.github.io/axicharts/shadcn |
| Registry install guide | https://axidify.github.io/axicharts/shadcn/registry |
| Registry catalog | https://axidify.github.io/axicharts/registry/registry.json |
| vs Recharts (live) | https://axidify.github.io/axicharts/compare |
| Benchmarks | https://github.com/Axidify/axicharts/blob/main/benchmarks/BENCHMARKS.md |

## Highlights

- MIT React chart library for dashboards — composable JSX, not an option blob
- shadcn-compatible `chartConfig` + `tokens.css` — drop into existing Tailwind/shadcn apps
- Custom registry (6 items): bar, line, donut, area, stacked bar, chartConfig lib
- CI validates registry JSON + `shadcn add` dry-run on every `pnpm ci`
- Live canvas path (uPlot) for 5–10 Hz ops walls; ECharts for pie/specialty
- Panel spec JSON + `ejectPanel` — same render path for AI planners and hand-built dashboards

## Feedback welcome

- Recharts/shadcn Charts ports — what's still missing?
- Registry items you'd like next (combo, candlestick, waterfall)?
- Upstream shadcn/ui registry — PR https://github.com/shadcn-ui/ui/pull/11215 (GTM-5)
