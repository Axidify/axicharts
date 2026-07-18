# shadcn/ui registry prep (GTM-2)

In-repo documentation for a future **shadcn-style component registry** submission. This is **not** an external PR to [shadcn/ui](https://ui.shadcn.com) — see GTM-3 in the Dashboarder roadmap.

## Goal

Let `npx shadcn@latest add chart-axi-*` (or a custom registry URL) install:

1. A thin wrapper around `ChartContainer` + chart children
2. Peer dependencies on `@axicharts/charts`, `@axicharts/charts-theme`, `echarts`, `uplot`
3. Optional `chartConfig` TypeScript helper matching shadcn Charts conventions

## Registry item shape

See [`registry-item.json`](./registry-item.json) for a stub aligned with [shadcn registry schema](https://ui.shadcn.com/docs/registry/registry-item-json).

## Dependencies to declare

```json
{
  "dependencies": [
    "@axicharts/charts",
    "@axicharts/charts-theme"
  ],
  "devDependencies": [],
  "registryDependencies": []
}
```

Peer / app-level (document in README, not bundled):

- `react`, `react-dom`
- `echarts` (pie, candlestick, waterfall, heatmap adapters)
- `uplot` (live cartesian canvas path)

## Component stub

Registry consumers get composable JSX — not an option blob:

```tsx
import { ChartContainer, BarChart } from "@axicharts/charts";
import { cleanTheme } from "@axicharts/charts-theme";

export function ChartBarDemo() {
  return (
    <ChartContainer theme={cleanTheme} height={220} config={chartConfig}>
      <BarChart
        categories={["Mon", "Tue", "Wed"]}
        series={[{ name: "Desktop", data: [186, 305, 237] }]}
      />
    </ChartContainer>
  );
}
```

## Spec path (differentiator)

For AI / runtime dashboards, pair registry components with panel JSON:

- Examples: `../browser-share-donut.panel.json`, `../revenue-line-chartconfig.panel.json`
- CLI: `npx @axicharts/charts-spec eject examples/throughput-bar-color.panel.json`

## Links

- Docs gallery: `/shadcn`
- Community templates: `/templates/community`
- Migration checklist: docs `/shadcn` § Recharts → AxiCharts
