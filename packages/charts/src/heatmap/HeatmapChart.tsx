"use client";

import type { ReactElement } from "react";
import {
  EChartsHeatmap,
  type HeatmapMatrix,
} from "@axicharts/charts-echarts";
import { useChartLayout } from "../container/ChartLayoutContext";

export type HeatmapChartProps = {
  matrix: HeatmapMatrix;
  min?: number;
  max?: number;
};

export function HeatmapChart({
  matrix,
  min,
  max,
}: HeatmapChartProps): ReactElement | null {
  const { size, ready, theme } = useChartLayout();

  if (!ready || size.width < 1 || size.height < 1) {
    return null;
  }

  return (
    <EChartsHeatmap
      width={Math.floor(size.width)}
      height={Math.floor(size.height)}
      matrix={matrix}
      theme={theme}
      min={min}
      max={max}
    />
  );
}

export type { HeatmapMatrix } from "@axicharts/charts-echarts";
