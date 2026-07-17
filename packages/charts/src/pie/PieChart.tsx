"use client";

import type { ReactElement, ReactNode } from "react";
import { useMemo } from "react";
import { EChartsPie, type PieSlice } from "@axicharts/charts-echarts";
import { useChartLayout } from "../container/ChartLayoutContext";
import { EChartsInteractionShell } from "../chrome/EChartsInteractionShell";
import { useEChartsInteraction } from "../sync/useEChartsInteraction";
import { useResolvedPieProps } from "../composable/resolvePieProps";
import { applyChartConfigToPieSlices } from "../config/applyChartConfig";

export type PieChartProps = {
  slices?: PieSlice[];
  data?: Record<string, unknown>[];
  children?: ReactNode;
  innerRadius?: number;
  showLabels?: boolean;
};

function PiePlot({
  slices,
  innerRadius,
  showLabels,
}: {
  slices: PieSlice[];
  innerRadius?: number;
  showLabels?: boolean;
}): ReactElement {
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
  slices: slicesProp,
  data,
  children,
  innerRadius: innerRadiusProp,
  showLabels: showLabelsProp,
}: PieChartProps): ReactElement | null {
  const { size, ready, config } = useChartLayout();
  const { slices: resolvedSlices, innerRadius, showLabels } = useResolvedPieProps(
    {
      slices: slicesProp,
      data,
      children,
      innerRadius: innerRadiusProp,
      showLabels: showLabelsProp,
    },
    config,
  );
  const slices = useMemo(
    () => applyChartConfigToPieSlices(resolvedSlices, config),
    [resolvedSlices, config],
  );

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
