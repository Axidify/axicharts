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

## Packages

| Package | Description |
|---------|-------------|
| `@axicharts/charts` | React API — all chart types, primitives, registry, formatters |
| `@axicharts/charts-theme` | `cleanTheme`, `liveTheme`, `industrialTheme`, CSS tokens |
| `@axicharts/charts-canvas` | uPlot — line, bar, area (live path) |
| `@axicharts/charts-echarts` | ECharts — pie, candlestick, waterfall, heatmap |
| `@axicharts/charts-core` | Layout math + `formatTick` / `registerTickFormat` |
| `@axicharts/charts-spec` | Vertical templates, planner, eject CLI |
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
pnpm test:perf   # 6-panel uPlot setData gate
pnpm size        # bundle gzip budgets
pnpm storybook
pnpm docs
```

## Storybook gates

**Round 2 (universal + ops):** G, H, I, J, K, L + Industrial Primitives  
**Round 3 (vertical breadth):** M · Finance, N · Trading, O · Resources

## License

MIT
