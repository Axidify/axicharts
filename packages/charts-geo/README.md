# @axicharts/charts-geo

Community plugin — regional cartogram map for facility and capacity dashboards.

## Install

```bash
npm install @axicharts/charts-geo @axicharts/charts
```

## Usage

```tsx
import "@axicharts/charts-geo/register";
import { GeoMapChart, SAMPLE_GEO_REGIONS } from "@axicharts/charts-geo";
import { ChartContainer } from "@axicharts/charts";
import { cleanTheme } from "@axicharts/charts-theme";

export function RegionalUtilization() {
  return (
    <ChartContainer theme={cleanTheme} height={200} width={320}>
      <GeoMapChart regions={SAMPLE_GEO_REGIONS} />
    </ChartContainer>
  );
}
```

Registering adds `geo` to the `registerChartType` registry for spec compilers and agents.

## License

MIT
