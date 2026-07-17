# @axicharts/charts-andon

Community plugin — production andon board for line and cell status walls.

## Install

```bash
npm install @axicharts/charts-andon @axicharts/charts
```

## Usage

```tsx
import "@axicharts/charts-andon/register";
import { AndonBoard, SAMPLE_ANDON_STATIONS } from "@axicharts/charts-andon";
import { ChartContainer } from "@axicharts/charts";
import { industrialTheme } from "@axicharts/charts-theme";

export function LineOverview() {
  return (
    <ChartContainer theme={industrialTheme} height={200} width={360}>
      <AndonBoard stations={SAMPLE_ANDON_STATIONS} columns={4} />
    </ChartContainer>
  );
}
```

Registering adds `andon` to the `registerChartType` registry for spec compilers and agents.

## License

MIT
