"use client";

import type { ReactElement } from "react";
import { EChartsPie, type PieSlice } from "@axicharts/charts-echarts";
import { useChartLayout } from "../container/ChartLayoutContext";

export type PieChartProps = {
  slices: PieSlice[];
  innerRadius?: number;
  showLabels?: boolean;
};

export function PieChart({
  slices,
  innerRadius,
  showLabels,
}: PieChartProps): ReactElement | null {
  const { size, ready, theme } = useChartLayout();

  if (!ready || size.width < 1 || size.height < 1) {
    return null;
  }

  return (
    <EChartsPie
      width={Math.floor(size.width)}
      height={Math.floor(size.height)}
      slices={slices}
      theme={theme}
      innerRadius={innerRadius}
      showLabels={showLabels}
    />
  );
}

export type { PieSlice } from "@axicharts/charts-echarts";
