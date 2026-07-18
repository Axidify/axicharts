"use client";

import { AreaChart, ChartContainer, type ChartConfig } from "@axicharts/charts/cartesian";
import { cleanTheme } from "@axicharts/charts-theme";

export const chartConfig = {
  latency: { label: "Latency (ms)", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig;

export function ChartAxiArea() {
  return (
    <ChartContainer theme={cleanTheme} height={220} config={chartConfig}>
      <AreaChart
        categories={["Mon", "Tue", "Wed", "Thu", "Fri"]}
        series={[{ name: "latency", data: [42, 58, 35, 72, 48] }]}
      />
    </ChartContainer>
  );
}
