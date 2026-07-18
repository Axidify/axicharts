"use client";

import {
  ChartContainer,
  ComboChart,
  type ChartConfig,
} from "@axicharts/charts/cartesian";
import { cleanTheme } from "@axicharts/charts-theme";

export const chartConfig = {
  "Weekly total": { label: "Weekly total", color: "hsl(var(--chart-1))" },
  "Daily avg": { label: "Daily avg", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;

export function ChartAxiCombo() {
  return (
    <ChartContainer theme={cleanTheme} height={220} config={chartConfig}>
      <ComboChart
        categories={["W1", "W2", "W3", "W4", "W5"]}
        series={[
          { name: "Weekly total", kind: "bar", data: [120, 90, 150, 110, 180] },
          { name: "Daily avg", kind: "line", data: [17, 13, 21, 16, 26] },
        ]}
        showValues
      />
    </ChartContainer>
  );
}
