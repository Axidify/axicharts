"use client";

import type { ReactElement } from "react";
import {
  EChartsRadar,
  type RadarIndicator,
  type RadarSeries,
} from "@axicharts/charts-echarts";
import { useChartLayout } from "../container/ChartLayoutContext";
import { EChartsInteractionShell } from "../chrome/EChartsInteractionShell";
import { useEChartsInteraction } from "../sync/useEChartsInteraction";

export type RadarChartProps = {
  indicators: RadarIndicator[];
  series: RadarSeries[];
  showLabels?: boolean;
  showAxes?: boolean;
  areaFill?: boolean;
};

function RadarPlot({
  indicators,
  series,
  showLabels,
  showAxes,
  areaFill,
}: RadarChartProps): ReactElement {
  const { size, theme, mode } = useChartLayout();
  const interaction = useEChartsInteraction();

  return (
    <EChartsRadar
      width={Math.floor(size.width)}
      height={Math.floor(size.height)}
      theme={theme}
      indicators={indicators}
      series={series}
      showLabels={showLabels}
      showAxes={showAxes}
      areaFill={areaFill}
      animate={mode === "presentation"}
      mergeOption={mode === "live"}
      onItemHover={interaction.onItemHover}
    />
  );
}

export function RadarChart({
  indicators,
  series,
  showLabels: showLabelsProp,
  showAxes,
  areaFill,
}: RadarChartProps): ReactElement | null {
  const { size, ready, theme } = useChartLayout();

  if (!ready || size.width < 1 || size.height < 1) {
    return null;
  }

  const showLabels = showLabelsProp ?? true;
  const axes = showAxes ?? theme.axis.show;

  return (
    <EChartsInteractionShell
      plot={
        <RadarPlot
          indicators={indicators}
          series={series}
          showLabels={showLabels}
          showAxes={axes}
          areaFill={areaFill}
        />
      }
    />
  );
}

export type { RadarIndicator, RadarSeries } from "@axicharts/charts-echarts";
