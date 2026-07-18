# shadcn/ui custom registry (GTM-3)

Hosted **custom registry** for AxiCharts chart blocks — install via `npx shadcn@latest add <url>` without an upstream shadcn/ui PR.

## Hosted URLs

| Item | Install command |
|------|-----------------|
| Catalog | https://axidify.github.io/axicharts/registry/registry.json |
| Bar | `npx shadcn@latest add https://axidify.github.io/axicharts/registry/chart-axi-bar.json` |
| Line | `npx shadcn@latest add https://axidify.github.io/axicharts/registry/chart-axi-line.json` |
| Donut | `npx shadcn@latest add https://axidify.github.io/axicharts/registry/chart-axi-donut.json` |
| Area | `npx shadcn@latest add https://axidify.github.io/axicharts/registry/chart-axi-area.json` |
| Stacked bar | `npx shadcn@latest add https://axidify.github.io/axicharts/registry/chart-axi-stacked-bar.json` |
| chartConfig lib | `npx shadcn@latest add https://axidify.github.io/axicharts/registry/chart-axi-chart-config.json` |

Docs install guide: https://axidify.github.io/axicharts/shadcn/registry

## Source layout

```
registry/
  registry.json              # catalog index (generated)
  components/charts/*.tsx    # thin ChartContainer wrappers
scripts/build-registry.mjs   # → apps/docs/public/registry/
```

Run `node scripts/build-registry.mjs` (also runs on `pnpm docs` prebuild).

## Dependencies declared per item

```json
{
  "dependencies": [
    "@axicharts/charts",
    "@axicharts/charts-theme"
  ]
}
```

Peer / app-level (documented in item `docs` field and install page):

- `react`, `react-dom`
- `echarts` (pie, candlestick, waterfall, heatmap adapters)
- `uplot` (live cartesian canvas path)

## Component pattern

Registry consumers get composable JSX — not an option blob:

```tsx
import { ChartContainer, BarChart } from "@axicharts/charts";
import { cleanTheme } from "@axicharts/charts-theme";

export function ChartAxiBar() {
  return (
    <ChartContainer theme={cleanTheme} height={220} config={chartConfig}>
      <BarChart categories={[...]} series={[...]} />
    </ChartContainer>
  );
}
```

## Links

- Docs gallery: `/shadcn`
- Registry install: `/shadcn/registry`
- Community templates: `/templates/community`
- Launch copy: [LAUNCH.md](./LAUNCH.md)

## GTM-4 (shipped)

- Registry E2E CI — `pnpm test:registry`
- Stacked bar + chartConfig lib registry items
- README npm badges, LAUNCH_DISCUSSION.md, `registry/UPSTREAM.md`

## GTM-5 (defer)

- Upstream shadcn/ui registry submission (`registry/UPSTREAM.md`)
- Paid template marketplace
- Actual social posting (draft bullets in LAUNCH.md / LAUNCH_DISCUSSION.md)
