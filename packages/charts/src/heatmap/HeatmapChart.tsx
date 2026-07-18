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
  showLabels?: boolean;
  showAxes?: boolean;
  cellFormatter?: (value: number) => string;
};

function HeatmapPlot({
  matrix,
  min,
  max,
  showLabels,
  showAxes,
  cellFormatter,
}: HeatmapChartProps): ReactElement {
  const { size, theme, mode } = useChartLayout();
  const interaction = useEChartsInteraction();

  return (
    <EChartsHeatmap
      width={Math.floor(size.width)}
      height={Math.floor(size.height)}
      matrix={matrix}
      theme={theme}
      min={min}
      max={max}
      showLabels={showLabels}
      showAxes={showAxes}
      cellFormatter={cellFormatter}
      mergeOption={mode === "live"}
      brushRange={interaction.followerBrushRange}
      chartId={interaction.chartId}
      onSyncIndex={interaction.onSyncIndex}
      syncIndex={interaction.syncIndex}
      syncSourceId={interaction.syncSourceId}
      onItemHover={interaction.onItemHover}
    />
  );
}

export function HeatmapChart({
  matrix,
  min,
  max,
  showLabels,
  showAxes,
  cellFormatter,
}: HeatmapChartProps): ReactElement | null {
  const { size, ready, theme } = useChartLayout();

  if (!ready || size.width < 1 || size.height < 1) {
    return null;
  }

  const axes = showAxes ?? theme.axis.show;

  return (
    <EChartsInteractionShell
      plot={
        <HeatmapPlot
          matrix={matrix}
          min={min}
          max={max}
          showLabels={showLabels}
          showAxes={axes}
          cellFormatter={cellFormatter}
        />
      }
    />
  );
}

export type { HeatmapMatrix } from "@axicharts/charts-echarts";
