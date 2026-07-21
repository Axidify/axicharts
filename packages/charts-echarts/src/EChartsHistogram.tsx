"use client";

import type { ReactElement } from "react";
import type { EChartsOption } from "echarts";
import type { ChartTheme } from "@axicharts/charts-theme";
import type { ChartGraphicElement } from "@axicharts/charts-canvas";
import {
  axisLabelStyle,
  gridOptions,
  hiddenTooltip,
  isCompactTile,
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
  graphics?: ChartGraphicElement[];
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
  graphics,
  onItemHover,
}: EChartsHistogramProps): ReactElement {
  const palette = seriesPalette(theme);
  const color = toneColor(tone, theme) ?? palette[0]!;
  const compact = isCompactTile(width, height);
  const denseBins = categories.length > 6;
  const grid = gridOptions(theme, compact);
  const axisFont = {
    ...axisLabelStyle(theme),
    fontSize: compact ? 10 : 11,
    ...(compact && denseBins
      ? { rotate: 30, interval: 0, hideOverlap: true }
      : {}),
  };

  const option: EChartsOption = withPresentationAnimation(
    {
    grid: {
      ...grid,
      bottom: compact && denseBins ? 36 : grid.bottom,
    },
    tooltip: hiddenTooltip(),
    xAxis: {
      type: "category",
      data: categories,
      show: showAxes,
      axisLabel: axisFont,
      splitLine: { show: false },
    },
    yAxis: {
      type: "value",
      show: showAxes,
      axisLabel: {
        ...axisLabelStyle(theme),
        fontSize: compact ? 10 : 11,
      },
      splitLine: splitLineStyle(theme),
    },
    series: [
      {
        type: "bar",
        data: values,
        barMaxWidth: compact ? 36 : 48,
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
    graphics,
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
