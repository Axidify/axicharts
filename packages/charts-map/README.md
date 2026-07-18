# @axicharts/charts-map

Community plugin — TopoJSON choropleth map for regional dashboards.

Distinct from `@axicharts/charts-geo` (rectangle cartogram, `type: geo`). This package renders real geographic paths from TopoJSON (`type: map`).

## Install

```bash
npm install @axicharts/charts-map @axicharts/charts
```

## Usage

```tsx
import "@axicharts/charts-map/register";
import {
  MapChart,
  SAMPLE_US_TOPOLOGY,
  SAMPLE_US_VALUES,
} from "@axicharts/charts-map";
import { ChartContainer } from "@axicharts/charts";
import { cleanTheme } from "@axicharts/charts-theme";

export function RegionalChoropleth() {
  return (
    <ChartContainer theme={cleanTheme} height={220} width={360}>
      <MapChart topology={SAMPLE_US_TOPOLOGY} values={SAMPLE_US_VALUES} />
    </ChartContainer>
  );
}
```

Registering adds `map` to the `registerChartType` registry for spec compilers and agents.

## License

MIT
