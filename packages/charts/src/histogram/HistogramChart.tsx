"use client";

import type { ReactElement } from "react";
import { EChartsHistogram } from "@axicharts/charts-echarts";
import type { SeriesTone } from "@axicharts/charts-canvas";
import { useChartLayout } from "../container/ChartLayoutContext";
import { EChartsInteractionShell } from "../chrome/EChartsInteractionShell";
import { useEChartsInteraction } from "../sync/useEChartsInteraction";

export type HistogramChartProps = {
  categories: string[];
  values: number[];
  tone?: SeriesTone;
  showAxes?: boolean;
  valueSuffix?: string;
};

function HistogramPlot({
  categories,
  values,
  tone,
  showAxes,
  valueSuffix,
}: HistogramChartProps): ReactElement {
  const { size, theme, mode } = useChartLayout();
  const interaction = useEChartsInteraction();

  return (
    <EChartsHistogram
      width={Math.floor(size.width)}
      height={Math.floor(size.height)}
      theme={theme}
      categories={categories}
      values={values}
      tone={tone}
      showAxes={showAxes}
      valueSuffix={valueSuffix}
      animate={mode === "presentation"}
      onItemHover={interaction.onItemHover}
    />
  );
}

export function HistogramChart({
  categories,
  values,
  tone,
  showAxes,
  valueSuffix,
}: HistogramChartProps): ReactElement | null {
  const { size, ready, theme } = useChartLayout();

  if (
    !ready ||
    size.width < 1 ||
    size.height < 1 ||
    categories.length === 0 ||
    values.length === 0
  ) {
    return null;
  }

  const axes = showAxes ?? theme.axis.show;

  return (
    <EChartsInteractionShell
      plot={
        <HistogramPlot
          categories={categories}
          values={values}
          tone={tone}
          showAxes={axes}
          valueSuffix={valueSuffix}
        />
      }
    />
  );
}
