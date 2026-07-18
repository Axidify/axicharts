"use client";

import type { ReactElement } from "react";
import {
  EChartsScatter,
  type ScatterSeries,
} from "@axicharts/charts-echarts";
import { useChartLayout } from "../container/ChartLayoutContext";
import { EChartsInteractionShell } from "../chrome/EChartsInteractionShell";
import { useEChartsInteraction } from "../sync/useEChartsInteraction";

export type ScatterChartProps = {
  series: ScatterSeries[];
  showAxes?: boolean;
  xLabel?: string;
  yLabel?: string;
  xSuffix?: string;
  ySuffix?: string;
};

function ScatterPlot({
  series,
  showAxes,
  xLabel,
  yLabel,
  xSuffix,
  ySuffix,
}: ScatterChartProps): ReactElement {
  const { size, theme } = useChartLayout();
  const interaction = useEChartsInteraction();

  return (
    <EChartsScatter
      width={Math.floor(size.width)}
      height={Math.floor(size.height)}
      series={series}
      theme={theme}
      showAxes={showAxes}
      xLabel={xLabel}
      yLabel={yLabel}
      xSuffix={xSuffix}
      ySuffix={ySuffix}
      onItemHover={interaction.onItemHover}
    />
  );
}

export function ScatterChart({
  series,
  showAxes,
  xLabel,
  yLabel,
  xSuffix,
  ySuffix,
}: ScatterChartProps): ReactElement | null {
  const { size, ready, theme } = useChartLayout();

  if (!ready || size.width < 1 || size.height < 1) {
    return null;
  }

  const axes = showAxes ?? theme.axis.show;

  return (
    <EChartsInteractionShell
      plot={
        <ScatterPlot
          series={series}
          showAxes={axes}
          xLabel={xLabel}
          yLabel={yLabel}
          xSuffix={xSuffix}
          ySuffix={ySuffix}
        />
      }
    />
  );
}

export type { ScatterPoint, ScatterSeries } from "@axicharts/charts-echarts";
