"use client";

import type { ReactElement } from "react";
import type { EChartsOption } from "echarts";
import {
  EChartsOptionChart as EChartsOptionPlot,
} from "@axicharts/charts-echarts";
import { useChartLayout } from "../container/ChartLayoutContext";
import { EChartsInteractionShell } from "../chrome/EChartsInteractionShell";
import { useEChartsInteraction } from "../sync/useEChartsInteraction";

import type { ChartGraphicElement } from "@axicharts/charts-canvas";

export type EChartsOptionChartProps = {
  option: EChartsOption;
  mergeOption?: boolean;
  categories?: string[];
  graphics?: ChartGraphicElement[];
};

function EChartsOptionPlotWrapper({
  option,
  mergeOption,
  categories,
  graphics,
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
      graphics={graphics}
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
  graphics,
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
          graphics={graphics}
        />
      }
    />
  );
}
