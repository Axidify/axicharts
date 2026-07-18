"use client";

import {
  SwarmChart,
  ChartContainer,
} from "@axicharts/charts/swarm";
import { cleanTheme } from "@axicharts/charts-theme";

export function ChartAxiSwarm() {
  return (
    <ChartContainer theme={cleanTheme} height={360} width={640}>
      <SwarmChart
        items={[
          {
            category: "API",
            values: [12, 18, 22, 28, 35, 42, 55, 72, 88, 120],
          },
          {
            category: "DB",
            values: [8, 14, 20, 26, 34, 48, 60, 78, 95, 110],
          },
        ]}
        valueSuffix=" ms"
        showMedianLine
      />
    </ChartContainer>
  );
}
