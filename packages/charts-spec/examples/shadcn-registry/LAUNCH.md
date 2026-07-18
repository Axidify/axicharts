# AxiCharts launch assets (GTM-3)

## Positioning

**Better Recharts for dashboards** — composable `ChartContainer` + shadcn-compatible `chartConfig`, live uPlot canvas when ops walls need 5–10 Hz, and the same renderer path for hand-authored JSX and AI-generated panel spec JSON.

## Install

```bash
npm install @axicharts/charts @axicharts/charts-theme echarts uplot
```

Or via shadcn custom registry:

```bash
npx shadcn@latest add https://axidify.github.io/axicharts/registry/chart-axi-bar.json
```

## Links

| Asset | URL |
|-------|-----|
| vs Recharts live demo | https://axidify.github.io/axicharts/compare |
| shadcn migration gallery | https://axidify.github.io/axicharts/shadcn |
| shadcn registry install | https://axidify.github.io/axicharts/shadcn/registry |
| Registry catalog | https://axidify.github.io/axicharts/registry/registry.json |
| Benchmarks | `benchmarks/BENCHMARKS.md` in axicharts repo |
| Community templates | https://axidify.github.io/axicharts/templates/community |

## Draft — GitHub Discussion

**Title:** AxiCharts v0.3.16 — shadcn custom registry + migration gallery

**Body bullets:**
- MIT React chart library for dashboards — composable JSX, not an option blob
- shadcn-compatible `chartConfig` + `tokens.css` — drop into existing Tailwind/shadcn apps
- Custom registry: `npx shadcn add https://axidify.github.io/axicharts/registry/chart-axi-bar.json`
- Live canvas path (uPlot) for 5–10 Hz ops walls; ECharts for pie/specialty
- Panel spec JSON + `ejectPanel` — same render path for AI planners and hand-built dashboards
- Compare demo vs Recharts: /compare

## Draft — Hacker News

**Title:** Show HN: AxiCharts – composable React charts with shadcn registry and live canvas

**Comment bullets:**
- Built for dashboard density: `ChartContainer`, chartConfig, spec JSON, embed runtime
- shadcn custom registry (not upstream PR yet) — bar/line/donut/area blocks
- uPlot for cartesian live; ECharts adapters for pie/waterfall/etc.
- MIT, monorepo on GitHub (Axidify/axicharts)
- Would love feedback from folks who've hit Recharts flex/perf limits

## Draft — Twitter / X thread

1. Shipped @axicharts v0.3.16 — shadcn custom registry for bar/line/donut/area 📊
2. `npx shadcn add https://axidify.github.io/axicharts/registry/chart-axi-bar.json` — thin wrappers, real chart logic in @axicharts/charts
3. Migration gallery for Recharts/shadcn Charts ports → https://axidify.github.io/axicharts/shadcn
4. Live ops wall vs Recharts: https://axidify.github.io/axicharts/compare
5. Same renderer for JSX and AI panel spec JSON — `compilePanel` / `ejectPanel`
