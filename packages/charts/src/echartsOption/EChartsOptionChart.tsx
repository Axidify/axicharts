"use client";

import type { ReactElement } from "react";
import type { EChartsOption } from "echarts";
import {
  EChartsOptionChart as EChartsOptionPlot,
} from "@axicharts/charts-echarts";
import { useChartLayout } from "../container/ChartLayoutContext";
import { EChartsInteractionShell } from "../chrome/EChartsInteractionShell";
import { useEChartsInteraction } from "../sync/useEChartsInteraction";

export type EChartsOptionChartProps = {
  option: EChartsOption;
  mergeOption?: boolean;
  categories?: string[];
};

function EChartsOptionPlotWrapper({
  option,
  mergeOption,
  categories,
}: EChartsOptionChartProps): ReactElement {
  const { size, theme, mode } = useChartLayout();
  const interaction = useEChartsInteraction();

  return (
    <EChartsOptionPlot
      width={Math.floor(size.width)}
      height={Math.floor(size.height)}
      theme={theme}
      option={option}
      categories={categories}
      chartId={interaction.chartId}
      syncIndex={interaction.syncIndex}
      syncSourceId={interaction.syncSourceId}
      onSyncIndex={interaction.onSyncIndex}
      animate={mode === "presentation"}
      mergeOption={mergeOption ?? mode === "live"}
      onCursor={interaction.onCursor}
      onItemHover={interaction.onItemHover}
    />
  );
}

export function EChartsOptionChart({
  option,
  mergeOption,
  categories,
}: EChartsOptionChartProps): ReactElement | null {
  const { size, ready } = useChartLayout();

  if (!ready || size.width < 1 || size.height < 1) {
    return null;
  }

  return (
    <EChartsInteractionShell
      plot={
        <EChartsOptionPlotWrapper
          option={option}
          mergeOption={mergeOption}
          categories={categories}
        />
      }
    />
  );
}
