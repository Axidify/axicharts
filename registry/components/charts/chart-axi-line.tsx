"use client";

import { ChartContainer, LineChart, type ChartConfig } from "@axicharts/charts/cartesian";
import { cleanTheme } from "@axicharts/charts-theme";

export const chartConfig = {
  revenue: { label: "Revenue", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig;

export function ChartAxiLine() {
  return (
    <ChartContainer theme={cleanTheme} height={220} config={chartConfig}>
      <LineChart
        fill
        categories={["Mon", "Tue", "Wed", "Thu", "Fri"]}
        series={[{ name: "revenue", data: [4200, 3800, 5100, 4600, 5900] }]}
      />
    </ChartContainer>
  );
}
