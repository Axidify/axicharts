"use client";

import { BarChart, ChartContainer, type ChartConfig } from "@axicharts/charts";
import { cleanTheme } from "@axicharts/charts-theme";

export const chartConfig = {
  Done: { label: "Done", color: "hsl(var(--chart-1))" },
  "Carry-over": { label: "Carry-over", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;

export function ChartAxiStackedBar() {
  return (
    <ChartContainer theme={cleanTheme} height={220} config={chartConfig}>
      <BarChart
        stacked
        categories={["S1", "S2", "S3", "S4"]}
        series={[
          { name: "Done", data: [22, 26, 24, 28] },
          { name: "Carry-over", data: [6, 4, 5, 3] },
        ]}
      />
    </ChartContainer>
  );
}
