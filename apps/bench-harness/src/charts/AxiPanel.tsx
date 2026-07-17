import type { ReactElement } from "react";
import { ChartContainer, LineChart } from "@axicharts/charts";
import { cleanTheme } from "@axicharts/charts-theme";

export type PanelProps = {
  categories: string[];
  values: number[];
};

export function AxiPanel({ categories, values }: PanelProps): ReactElement {
  return (
    <ChartContainer theme={cleanTheme} mode="live" width={320} height={120}>
      <LineChart
        categories={categories}
        series={[{ name: "y", data: values }]}
        showAxes={false}
      />
    </ChartContainer>
  );
}
