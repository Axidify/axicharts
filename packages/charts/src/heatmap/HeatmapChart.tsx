"use client";

import type { ReactElement } from "react";
import { useMemo } from "react";
import {
  EChartsHeatmap,
  type HeatmapMatrix,
} from "@axicharts/charts-echarts";
import { useChartLayout } from "../container/ChartLayoutContext";
import { EChartsInteractionShell } from "../chrome/EChartsInteractionShell";
import { useEChartsInteraction } from "../sync/useEChartsInteraction";
import { buildHeatmapA11yDescriptor } from "../a11y/echartsDescriptor";
import { EChartsChartA11yRoot } from "../a11y/EChartsChartA11yRoot";

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
      animate={mode === "presentation"}
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
  const a11yDescriptor = useMemo(
    () => buildHeatmapA11yDescriptor({ matrix }),
    [matrix],
  );

  return (
    <EChartsChartA11yRoot
      descriptor={a11yDescriptor}
      style={{ width: size.width, height: size.height, position: "relative" }}
    >
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
    </EChartsChartA11yRoot>
  );
}

export type { HeatmapMatrix } from "@axicharts/charts-echarts";
