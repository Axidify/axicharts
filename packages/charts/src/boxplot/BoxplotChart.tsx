"use client";

import type { ReactElement } from "react";
import {
  EChartsBoxplot,
  type BoxplotItem,
  type BoxplotSeries,
} from "@axicharts/charts-echarts";
import { useChartLayout } from "../container/ChartLayoutContext";
import { EChartsInteractionShell } from "../chrome/EChartsInteractionShell";
import { useEChartsInteraction } from "../sync/useEChartsInteraction";

export type BoxplotChartProps = {
  items?: BoxplotItem[];
  series?: BoxplotSeries[];
  showAxes?: boolean;
  valueSuffix?: string;
};

function BoxplotPlot({
  items,
  series,
  showAxes,
  valueSuffix,
}: BoxplotChartProps): ReactElement {
  const { size, theme } = useChartLayout();
  const interaction = useEChartsInteraction();

  return (
    <EChartsBoxplot
      width={Math.floor(size.width)}
      height={Math.floor(size.height)}
      theme={theme}
      items={items}
      series={series}
      showAxes={showAxes}
      valueSuffix={valueSuffix}
      onItemHover={interaction.onItemHover}
    />
  );
}

export function BoxplotChart({
  items,
  series,
  showAxes,
  valueSuffix,
}: BoxplotChartProps): ReactElement | null {
  const { size, ready, theme } = useChartLayout();

  if (!ready || size.width < 1 || size.height < 1) {
    return null;
  }

  const axes = showAxes ?? theme.axis.show;

  return (
    <EChartsInteractionShell
      plot={
        <BoxplotPlot
          items={items}
          series={series}
          showAxes={axes}
          valueSuffix={valueSuffix}
        />
      }
    />
  );
}

export type { BoxplotItem, BoxplotSeries } from "@axicharts/charts-echarts";
