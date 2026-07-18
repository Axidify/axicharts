"use client";

import {
  ViolinChart,
  ChartContainer,
} from "@axicharts/charts/violin";
import { cleanTheme } from "@axicharts/charts-theme";

export function ChartAxiViolin() {
  return (
    <ChartContainer theme={cleanTheme} height={360} width={640}>
      <ViolinChart
        items={[
          {
            category: "API",
            samples: [12, 18, 22, 28, 35, 42, 55, 72, 88, 120],
          },
          {
            category: "DB",
            samples: [8, 14, 20, 26, 34, 48, 60, 78, 95, 110],
          },
        ]}
        valueSuffix=" ms"
      />
    </ChartContainer>
  );
}
