"use client";

import {
  BumpChart,
  ChartContainer,
} from "@axicharts/charts/bump";
import { cleanTheme } from "@axicharts/charts-theme";

export function ChartAxiBump() {
  return (
    <ChartContainer theme={cleanTheme} height={360} width={640}>
      <BumpChart
        data={{
          categories: ["2018", "2019", "2020", "2021"],
          series: [
            { name: "USA", ranks: [1, 1, 1, 1] },
            { name: "China", ranks: [2, 2, 2, 2] },
            { name: "Germany", ranks: [4, 3, 3, 3] },
            { name: "Japan", ranks: [3, 4, 4, 4] },
            { name: "UK", ranks: [5, 5, 5, 5] },
          ],
        }}
      />
    </ChartContainer>
  );
}
