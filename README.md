# AxiCharts

**The best free, open-source chart platform for React dashboards** — layout DX, live performance, and vertical breadth (finance, trading, resources, SaaS, ops) on one MIT-licensed stack.

Line/bar/area via uPlot; pie, candlestick, waterfall, and heatmap via ECharts; industrial SVG primitives; `ChartContainer` that sizes correctly in flex/grid layouts.

- **GitHub:** https://github.com/Axidify/axicharts
- **Storybook:** `pnpm storybook` → http://localhost:6006
- **Docs:** `pnpm docs` → http://localhost:3001 ([GitHub Pages](https://axidify.github.io/axicharts/))
- **Dashboarder:** `pnpm dashboarder` → http://localhost:3000
- **License:** MIT

## Install

```bash
pnpm add @axicharts/charts @axicharts/charts-theme echarts uplot
```

Peer dependencies: `react`, `react-dom`, `uplot`, `echarts`.

## Quick start

```tsx
import { ChartContainer, LineChart } from "@axicharts/charts";
import { cleanTheme } from "@axicharts/charts-theme";

export function LatencyPanel() {
  return (
    <ChartContainer theme={cleanTheme} height={200}>
      <LineChart
        categories={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
        series={[{ name: "p95", data: [42, 38, 55, 49, 62, 58, 71] }]}
        fill
      />
    </ChartContainer>
  );
}
```

## Scaffold a dashboard

From the axicharts repo (or after cloning):

```bash
pnpm create:dashboard my-dashboard
cd my-dashboard
pnpm install
pnpm dev
```

Tree-shaken subpaths: `@axicharts/charts/line`, `/bar`, `/area`, `/pie`, `/candlestick`, `/waterfall`, `/heatmap`.

## Migrating from Recharts / shadcn Charts

- **Same admin patterns** — `chartConfig` labels/colors, per-category `<Cell fill />`, area/line segmentation via `encoding.color`
- **Spec + eject** — panel JSON compiles to React; `ejectPanel` preserves Cell fills for hand-editing
- **Live when you need it** — uPlot canvas path for 5–10 Hz dashboards ([compare demo](https://axidify.github.io/axicharts/compare))

Gallery: [docs `/shadcn`](https://axidify.github.io/axicharts/shadcn) · [shadcn registry install](https://axidify.github.io/axicharts/shadcn/registry) · [community templates](https://axidify.github.io/axicharts/templates/community) · Storybook **Charts/ShadcnParity** · Examples in `packages/charts-spec/examples/`

```bash
# shadcn custom registry (bar/line/donut/area blocks)
npx shadcn@latest add https://axidify.github.io/axicharts/registry/chart-axi-bar.json
```

## Packages

| Package | Description |
|---------|-------------|
| `@axicharts/charts` | React API — all chart types, primitives, registry, formatters |
| `@axicharts/charts-theme` | `cleanTheme`, `liveTheme`, `industrialTheme`, CSS tokens |
| `@axicharts/charts-canvas` | uPlot — line, bar, area (live path) |
| `@axicharts/charts-echarts` | ECharts — pie, candlestick, waterfall, heatmap |
| `@axicharts/charts-core` | Layout math + `formatTick` / `registerTickFormat` |
| `@axicharts/charts-spec` | Vertical templates, rules planner, eject CLI |
| `@axicharts/charts-planner` | Phase 3 server planner — intent, LLM provider hooks, HTTP `/plan` |
| `@axicharts/charts-runtime` | Data adapters, embed SDK, spec portability |
| `@axicharts/charts-tank` | Community plugin — tank level chart (`registerChartType`) |
| `@axicharts/charts-geo` | Community plugin — regional cartogram map (`registerChartType`) |
| `@axicharts/charts-andon` | Community plugin — production andon board (`registerChartType`) |
| `@axicharts/charts-sankey` | Community plugin — Sankey flow diagram (`registerChartType`, ECharts) |

## Develop

```bash
pnpm install
pnpm build
pnpm test
pnpm test:perf   # uPlot update gates (500 / 5k / 10k + 6-panel)
pnpm bench       # collect published numbers → benchmarks/BENCHMARKS.md
pnpm bench:browser  # Chromium competitive vs Recharts/ECharts
pnpm size        # bundle gzip budgets
pnpm storybook
pnpm docs
```

## Storybook gates

**Round 2 (universal + ops):** G, H, I, J, K, L + Industrial Primitives — baseline **4/5**  
**Round 3 (all verticals):** **G–Q all 5/5** — KPI tiles, callouts, SLO/plan references (`C52–C62`)  
**Round 4 (presentation):** **E · Presentation 5/5** — hero KPI, deck callout, bold charts (`C65`)

**Granular styling (C68–C73):** Bar/Line/Area `<Cell fill />` + spec `encoding.color` — same renderer path for JSX and AI. Examples: `packages/charts-spec/examples/` · Storybook **ShadcnParity** / **RechartsCompare**.

Gates: G · SaaS clean · H · Rich ops · I · Detailed bars · J · Dual series · K · KPI + chart · L · Grid cells · M · Finance · N · Trading · O · Resources · P · Plugins wall · Q · Program dashboard · **E · Presentation**

## License

MIT
