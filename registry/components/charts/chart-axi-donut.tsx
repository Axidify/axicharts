"use client";

import { ChartContainer, PieChart, type ChartConfig } from "@axicharts/charts";
import { cleanTheme } from "@axicharts/charts-theme";

export const chartConfig = {
  chrome: { label: "Chrome", color: "hsl(var(--chart-1))" },
  safari: { label: "Safari", color: "hsl(var(--chart-2))" },
  firefox: { label: "Firefox", color: "hsl(var(--chart-3))" },
  other: { label: "Other", color: "hsl(var(--chart-4))" },
} satisfies ChartConfig;

export function ChartAxiDonut() {
  return (
    <ChartContainer theme={cleanTheme} height={220} config={chartConfig}>
      <PieChart
        innerRadius={60}
        slices={[
          { name: "chrome", value: 48 },
          { name: "safari", value: 28 },
          { name: "firefox", value: 14 },
          { name: "other", value: 10 },
        ]}
      />
    </ChartContainer>
  );
}
