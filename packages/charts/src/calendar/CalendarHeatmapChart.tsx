"use client";

import type { ReactElement } from "react";
import { useMemo } from "react";
import {
  EChartsCalendarHeatmap,
  type CalendarHeatmapData,
} from "@axicharts/charts-echarts";
import { useChartLayout } from "../container/ChartLayoutContext";
import { EChartsInteractionShell } from "../chrome/EChartsInteractionShell";
import { useEChartsInteraction } from "../sync/useEChartsInteraction";
import { buildCalendarHeatmapA11yDescriptor } from "../a11y/echartsDescriptor";
import { EChartsChartA11yRoot } from "../a11y/EChartsChartA11yRoot";

export type CalendarHeatmapChartProps = {
  data: CalendarHeatmapData;
  year?: number;
  range?: [string, string];
  min?: number;
  max?: number;
  showLabels?: boolean;
  cellSize?: number | [number, number];
  cellFormatter?: (value: number) => string;
};

function CalendarHeatmapPlot({
  data,
  year,
  range,
  min,
  max,
  showLabels,
  cellSize,
  cellFormatter,
}: CalendarHeatmapChartProps): ReactElement {
  const { size, theme, mode } = useChartLayout();
  const interaction = useEChartsInteraction();

  return (
    <EChartsCalendarHeatmap
      width={Math.floor(size.width)}
      height={Math.floor(size.height)}
      data={data}
      year={year}
      range={range}
      theme={theme}
      min={min}
      max={max}
      showLabels={showLabels}
      cellSize={cellSize}
      cellFormatter={cellFormatter}
      mergeOption={mode === "live"}
      animate={mode === "presentation"}
      chartId={interaction.chartId}
      syncSourceId={interaction.syncSourceId}
      onItemHover={interaction.onItemHover}
    />
  );
}

export function CalendarHeatmapChart({
  data,
  year,
  range,
  min,
  max,
  showLabels,
  cellSize,
  cellFormatter,
}: CalendarHeatmapChartProps): ReactElement | null {
  const { size, ready } = useChartLayout();

  if (!ready || size.width < 1 || size.height < 1) {
    return null;
  }

  const a11yDescriptor = useMemo(
    () => buildCalendarHeatmapA11yDescriptor({ data, year }),
    [data, year],
  );

  return (
    <EChartsChartA11yRoot
      descriptor={a11yDescriptor}
      style={{ width: size.width, height: size.height, position: "relative" }}
    >
      <EChartsInteractionShell
        plot={
          <CalendarHeatmapPlot
            data={data}
            year={year}
            range={range}
            min={min}
            max={max}
            showLabels={showLabels}
            cellSize={cellSize}
            cellFormatter={cellFormatter}
          />
        }
      />
    </EChartsChartA11yRoot>
  );
}

export type { CalendarHeatmapData, CalendarHeatmapPoint } from "@axicharts/charts-echarts";
