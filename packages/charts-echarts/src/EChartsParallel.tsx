"use client";

import type { ReactElement } from "react";
import type { EChartsOption } from "echarts";
import type { ChartTheme } from "@axicharts/charts-theme";
import type { ChartGraphicElement } from "@axicharts/charts-canvas";
import { axisLabelStyle, hiddenTooltip, seriesPalette, toneColor } from "./themeBridge";
import { withPresentationAnimation } from "./presentationAnimation";
import { useEChart, type EChartItemHoverEvent } from "./useEChart";
import type { ParallelDimension, ParallelSeries } from "./parallelTypes";

export type EChartsParallelProps = {
  width: number;
  height: number;
  theme: ChartTheme;
  dimensions: ParallelDimension[];
  series: ParallelSeries[];
  showAxes?: boolean;
  lineOpacity?: number;
  onItemHover?: (event: EChartItemHoverEvent) => void;
  mergeOption?: boolean;
  graphics?: ChartGraphicElement[];
  animate?: boolean;
};

export function EChartsParallel({
  width,
  height,
  theme,
  dimensions,
  series,
  showAxes = true,
  lineOpacity = 0.55,
  onItemHover,
  mergeOption = false,
  animate = false,
  graphics,
}: EChartsParallelProps): ReactElement {
  const palette = seriesPalette(theme);
  const labelStyle = axisLabelStyle(theme);
  const showLegend = series.length > 1;

  const maxByDimension = dimensions.map((dimension, index) => {
    if (dimension.max != null) {
      return dimension.max;
    }
    const fromSeries = series.reduce(
      (max, item) => Math.max(max, item.values[index] ?? 0),
      dimension.min ?? 0,
    );
    return Math.max(fromSeries, dimension.min != null ? dimension.min + 1 : 1);
  });

  const option: EChartsOption = withPresentationAnimation(
    {
      tooltip: hiddenTooltip(),
      legend: showLegend
        ? {
            show: true,
            top: 0,
            textStyle: { color: labelStyle.color, fontSize: 11 },
          }
        : { show: false },
      parallelAxis: dimensions.map((dimension, index) => ({
        dim: index,
        name: showAxes ? dimension.name : "",
        min: dimension.min,
        max: maxByDimension[index],
        nameTextStyle: labelStyle,
        axisLabel: labelStyle,
      })),
      parallel: {
        left: 48,
        right: 48,
        top: showLegend ? 48 : 36,
        bottom: 36,
        parallelAxisDefault: {
          type: "value",
          nameLocation: "end",
          nameGap: 16,
          nameTextStyle: labelStyle,
          axisLabel: labelStyle,
        },
      },
      series: series.map((item, index) => ({
        type: "parallel" as const,
        name: item.name,
        lineStyle: {
          width: 1.5,
          opacity: lineOpacity,
          color:
            item.color ??
            toneColor(item.tone, theme) ??
            palette[index % palette.length],
        },
        emphasis: {
          lineStyle: {
            width: 3,
            opacity: 0.95,
          },
        },
        data: [item.values],
      })),
    },
    animate,
  );

  const rootRef = useEChart({
    option,
    graphics,
    width,
    height,
    onItemHover,
    mergeOption,
    formatItemHover: (params) => {
      const mouse = params.event?.event;
      if (!mouse) return null;
      const values = Array.isArray(params.value) ? params.value : [];
      const title = params.name != null ? String(params.name) : "Series";
      return {
        title,
        rows: dimensions.map((dimension, index) => ({
          label: dimension.name,
          value: String(values[index] ?? 0),
          color: params.color,
        })),
        left: mouse.offsetX,
        top: mouse.offsetY,
      };
    },
  });

  return (
    <div
      ref={rootRef}
      className="axicharts-echarts"
      style={{ width, height, background: "transparent" }}
    />
  );
}
