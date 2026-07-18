"use client";

import type { ReactElement } from "react";
import type { EChartsOption } from "echarts";
import type { ChartTheme } from "@axicharts/charts-theme";
import {
  axisLabelStyle,
  gridOptions,
  hiddenTooltip,
  splitLineStyle,
  seriesPalette,
  toneColor,
} from "./themeBridge";
import { withPresentationAnimation } from "./presentationAnimation";
import { useEChart, type EChartItemHoverEvent } from "./useEChart";
import type { SeriesTone } from "./types";

export type EChartsHistogramProps = {
  width: number;
  height: number;
  theme: ChartTheme;
  categories: string[];
  values: number[];
  tone?: SeriesTone;
  showAxes?: boolean;
  valueSuffix?: string;
  animate?: boolean;
  mergeOption?: boolean;
  onItemHover?: (event: EChartItemHoverEvent) => void;
};

function formatValue(value: number, suffix = ""): string {
  const rounded = Math.abs(value) >= 100 ? value.toFixed(0) : value.toFixed(1);
  return `${rounded}${suffix}`;
}

export function EChartsHistogram({
  width,
  height,
  theme,
  categories,
  values,
  tone,
  showAxes = true,
  valueSuffix = "",
  animate = false,
  mergeOption,
  onItemHover,
}: EChartsHistogramProps): ReactElement {
  const palette = seriesPalette(theme);
  const color = toneColor(tone, theme) ?? palette[0]!;

  const option: EChartsOption = withPresentationAnimation(
    {
    grid: gridOptions(theme),
    tooltip: hiddenTooltip(),
    xAxis: {
      type: "category",
      data: categories,
      show: showAxes,
      axisLabel: axisLabelStyle(theme),
      splitLine: { show: false },
    },
    yAxis: {
      type: "value",
      show: showAxes,
      axisLabel: axisLabelStyle(theme),
      splitLine: splitLineStyle(theme),
    },
    series: [
      {
        type: "bar",
        data: values,
        barMaxWidth: 48,
        itemStyle: {
          color,
          borderRadius: [theme.bar.radius, theme.bar.radius, 0, 0],
        },
      },
    ],
  },
    animate,
  );

  const rootRef = useEChart({
    option,
    width,
    height,
    onItemHover,
    mergeOption: mergeOption ?? !animate,
    formatItemHover: (params) => {
      const mouse = params.event?.event;
      if (!mouse) return null;
      const value = typeof params.value === "number" ? params.value : 0;
      const title =
        typeof params.name === "string" ? params.name : "Bin";

      return {
        title,
        rows: [
          {
            label: "Count",
            value: formatValue(value, valueSuffix),
            color: params.color,
          },
        ],
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
