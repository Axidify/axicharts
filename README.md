# AxiCharts

**Operational dashboard charts for React** — live-native line/bar charts, industrial SVG primitives (gauge, digital, status lamp), and a `ChartContainer` that actually sizes correctly in flex/grid layouts.

- **GitHub:** https://github.com/Axidify/axicharts
- **Storybook:** `pnpm storybook` → http://localhost:6006

## Install

```bash
pnpm add @axicharts/charts @axicharts/charts-theme uplot
```

Peer dependencies: `react`, `react-dom`, `uplot`.

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
| `@axicharts/charts` | React API — `ChartContainer`, `LineChart`, `BarChart`, `Gauge`, `Digital`, `StatusLamp`, `Stat`, registry |
| `@axicharts/charts-theme` | `cleanTheme`, `liveTheme`, `industrialTheme`, CSS tokens |
| `@axicharts/charts-canvas` | uPlot adapters (pulled in by `@axicharts/charts`) |
| `@axicharts/charts-core` | Pure layout/math (no React) |

## Develop

```bash
pnpm install
pnpm build
pnpm test
pnpm test:perf   # 6-panel uPlot setData gate
pnpm size        # bundle gzip budgets
pnpm storybook
```

## C1 Storybook gate (round 2 mockups)

All six acceptance stories live under **Mockups/** in Storybook: G, H, I, J, K, L + Industrial Primitives.

## License

MIT
