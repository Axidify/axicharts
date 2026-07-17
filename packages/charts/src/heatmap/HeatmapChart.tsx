"use client";

import type { ReactElement } from "react";
import {
  EChartsHeatmap,
  type HeatmapMatrix,
} from "@axicharts/charts-echarts";
import { useChartLayout } from "../container/ChartLayoutContext";
import { EChartsInteractionShell } from "../chrome/EChartsInteractionShell";
import { useEChartsInteraction } from "../sync/useEChartsInteraction";

export type HeatmapChartProps = {
  matrix: HeatmapMatrix;
  min?: number;
  max?: number;
};

function HeatmapPlot({ matrix, min, max }: HeatmapChartProps): ReactElement {
  const { size, theme } = useChartLayout();
  const interaction = useEChartsInteraction();

  return (
    <EChartsHeatmap
      width={Math.floor(size.width)}
      height={Math.floor(size.height)}
      matrix={matrix}
      theme={theme}
      min={min}
      max={max}
      onItemHover={interaction.onItemHover}
    />
  );
}

export function HeatmapChart({
  matrix,
  min,
  max,
}: HeatmapChartProps): ReactElement | null {
  const { size, ready } = useChartLayout();

  if (!ready || size.width < 1 || size.height < 1) {
    return null;
  }

  return (
    <EChartsInteractionShell
      plot={<HeatmapPlot matrix={matrix} min={min} max={max} />}
    />
  );
}

export type { HeatmapMatrix } from "@axicharts/charts-echarts";
