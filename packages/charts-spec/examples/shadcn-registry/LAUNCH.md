# AxiCharts launch assets (GTM-3 / GTM-4)

## Positioning

**Better Recharts for dashboards** — composable `ChartContainer` + shadcn-compatible `chartConfig`, live uPlot canvas when ops walls need 5–10 Hz, and the same renderer path for hand-authored JSX and AI-generated panel spec JSON.

## Install

```bash
npm install @axicharts/charts @axicharts/charts-theme echarts uplot
```

Or via shadcn custom registry:

```bash
npx shadcn@latest add https://axidify.github.io/axicharts/registry/chart-axi-bar.json
npx shadcn@latest add https://axidify.github.io/axicharts/registry/chart-axi-stacked-bar.json
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
| Upstream PR checklist | `registry/UPSTREAM.md` |

## Ready to post (GTM-4)

- **GitHub Discussion** — full draft in [LAUNCH_DISCUSSION.md](./LAUNCH_DISCUSSION.md) (v0.3.17, registry CI, stacked bar)
- **npm** — README badges + keywords updated; publish on release tag

## Draft — GitHub Discussion

**Title:** AxiCharts v0.3.17 — shadcn registry CI + stacked bar block

**Body:** See [LAUNCH_DISCUSSION.md](./LAUNCH_DISCUSSION.md) for copy-paste markdown.

## Draft — Hacker News

**Title:** Show HN: AxiCharts – composable React charts with shadcn registry and live canvas

**Comment bullets:**
- Built for dashboard density: `ChartContainer`, chartConfig, spec JSON, embed runtime
- shadcn custom registry (6 items) — CI validates `shadcn add` on every release
- uPlot for cartesian live; ECharts adapters for pie/waterfall/etc.
- MIT, monorepo on GitHub (Axidify/axicharts)
- Would love feedback from folks who've hit Recharts flex/perf limits

## Draft — Twitter / X thread

1. Shipped @axicharts v0.3.17 — registry E2E in CI + stacked bar / chartConfig lib blocks 📊
2. `npx shadcn add https://axidify.github.io/axicharts/registry/chart-axi-bar.json` — thin wrappers, real chart logic in @axicharts/charts
3. Migration gallery for Recharts/shadcn Charts ports → https://axidify.github.io/axicharts/shadcn
4. Live ops wall vs Recharts: https://axidify.github.io/axicharts/compare
5. Same renderer for JSX and AI panel spec JSON — `compilePanel` / `ejectPanel`

## Defer (GTM-5)

- Actually post Discussion / HN / Twitter
- Upstream shadcn/ui registry PR (`registry/UPSTREAM.md`)
- Paid template marketplace
