"use client";

import { ChartContainer, LineChart, type ChartConfig } from "@axicharts/charts/cartesian";
import { cleanTheme } from "@axicharts/charts-theme";

export const chartConfig = {
  Remaining: { label: "Remaining", color: "hsl(var(--chart-1))" },
  Ideal: { label: "Ideal", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;

export function ChartAxiMultiLine() {
  return (
    <ChartContainer theme={cleanTheme} height={220} config={chartConfig}>
      <LineChart
        fill
        categories={["D1", "D2", "D3", "D4", "D5", "D6", "D7"]}
        series={[
          { name: "Remaining", data: [120, 108, 96, 88, 74, 68, 58], tone: "warning" },
          { name: "Ideal", data: [120, 108, 96, 84, 72, 60, 48] },
        ]}
        legendVariant="inline"
      />
    </ChartContainer>
  );
}
