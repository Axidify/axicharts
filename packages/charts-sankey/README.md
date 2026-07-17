# @axicharts/charts-sankey

Community plugin — Sankey flow diagrams for energy, cost allocation, and funnel breakdowns.

Requires `echarts` as a peer dependency; only the Sankey module is loaded.

## Install

```bash
npm install @axicharts/charts-sankey @axicharts/charts echarts
```

## Usage

```tsx
import "@axicharts/charts-sankey/register";
import { SankeyChart, SAMPLE_SANKEY_FLOW } from "@axicharts/charts-sankey";
import { ChartContainer } from "@axicharts/charts";
import { cleanTheme } from "@axicharts/charts-theme";

export function EnergyAllocation() {
  return (
    <ChartContainer theme={cleanTheme} height={240} width={420}>
      <SankeyChart {...SAMPLE_SANKEY_FLOW} />
    </ChartContainer>
  );
}
```

Registering adds `sankey` to the `registerChartType` registry for spec compilers and agents.

## License

MIT
