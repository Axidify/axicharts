# @axicharts/charts-tank

Community plugin — vertical tank level visualization for industrial HMI dashboards.

## Install

```bash
npm install @axicharts/charts-tank @axicharts/charts
```

## Usage

```tsx
import "@axicharts/charts-tank/register";
import { TankChart } from "@axicharts/charts-tank";
import { ChartContainer } from "@axicharts/charts";
import { industrialTheme } from "@axicharts/charts-theme";

export function StorageTank() {
  return (
    <ChartContainer theme={industrialTheme} height={200} width={140}>
      <TankChart level={68} label="Tank 4" warningAt={75} criticalAt={90} />
    </ChartContainer>
  );
}
```

Registering adds `tank` to the `registerChartType` registry for spec compilers and agents.

## License

MIT
