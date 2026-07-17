"use client";

import type { ReactElement } from "react";
import { EChartsPie, type PieSlice } from "@axicharts/charts-echarts";
import { useChartLayout } from "../container/ChartLayoutContext";
import { EChartsInteractionShell } from "../chrome/EChartsInteractionShell";
import { useEChartsInteraction } from "../sync/useEChartsInteraction";

export type PieChartProps = {
  slices: PieSlice[];
  innerRadius?: number;
  showLabels?: boolean;
};

function PiePlot({
  slices,
  innerRadius,
  showLabels,
}: PieChartProps): ReactElement {
  const { size, theme } = useChartLayout();
  const interaction = useEChartsInteraction();

  return (
    <EChartsPie
      width={Math.floor(size.width)}
      height={Math.floor(size.height)}
      slices={slices}
      theme={theme}
      innerRadius={innerRadius}
      showLabels={showLabels}
      onItemHover={interaction.onItemHover}
    />
  );
}

export function PieChart({
  slices,
  innerRadius,
  showLabels,
}: PieChartProps): ReactElement | null {
  const { size, ready } = useChartLayout();

  if (!ready || size.width < 1 || size.height < 1) {
    return null;
  }

  return (
    <EChartsInteractionShell
      plot={
        <PiePlot
          slices={slices}
          innerRadius={innerRadius}
          showLabels={showLabels}
        />
      }
    />
  );
}

export type { PieSlice } from "@axicharts/charts-echarts";
