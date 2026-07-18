"use client";

import { ChartContainer, BarChart, type ChartConfig } from "@axicharts/charts";
import { cleanTheme } from "@axicharts/charts-theme";

export const chartConfig = {
  desktop: { label: "Desktop", color: "hsl(var(--chart-1))" },
  mobile: { label: "Mobile", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;

export function ChartAxiBar() {
  return (
    <ChartContainer theme={cleanTheme} height={220} config={chartConfig}>
      <BarChart
        categories={["Mon", "Tue", "Wed", "Thu", "Fri"]}
        series={[
          { name: "desktop", data: [186, 305, 237, 273, 209] },
          { name: "mobile", data: [80, 200, 120, 190, 130] },
        ]}
      />
    </ChartContainer>
  );
}
