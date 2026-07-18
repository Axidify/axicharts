"use client";

import type { ReactElement } from "react";
import type { EChartsOption } from "echarts";
import type { ChartTheme } from "@axicharts/charts-theme";
import type { ChartGraphicElement } from "@axicharts/charts-canvas";
import {
  axisLabelStyle,
  gridOptions,
  hiddenTooltip,
  reactAxisPointer,
  seriesPalette,
  splitLineStyle,
  toneColor,
} from "./themeBridge";
import { withPresentationAnimation } from "./presentationAnimation";
import { useEChart, type EChartItemHoverEvent } from "./useEChart";
import type { PictorialBarData } from "./pictorialBarTypes";

export type EChartsPictorialBarProps = {
  width: number;
  height: number;
  data: PictorialBarData;
  theme: ChartTheme;
  symbol?: string;
  symbolRepeat?: boolean;
  barGap?: number | string;
  onItemHover?: (event: EChartItemHoverEvent) => void;
  mergeOption?: boolean;
  graphics?: ChartGraphicElement[];
  animate?: boolean;
};

const DEFAULT_SYMBOL = "roundRect";

export function EChartsPictorialBar({
  width,
  height,
  data,
  theme,
  symbol: symbolProp,
  symbolRepeat = true,
  barGap = "20%",
  onItemHover,
  mergeOption = false,
  animate = false,
  graphics,
}: EChartsPictorialBarProps): ReactElement {
  const { items } = data;
  const palette = seriesPalette(theme);
  const defaultSymbol = symbolProp ?? data.symbol ?? DEFAULT_SYMBOL;
  const categories = items.map((item) => item.category);
  const maxValue = Math.max(...items.map((item) => item.value), 1);

  const seriesData = items.map((item, index) => ({
    value: item.value,
    symbol: item.symbol ?? defaultSymbol,
    itemStyle: {
      color:
        item.color ??
        toneColor(item.tone, theme) ??
        palette[index % palette.length],
    },
  }));

  const option: EChartsOption = withPresentationAnimation(
    {
      grid: gridOptions(theme),
      tooltip: hiddenTooltip(),
      axisPointer: reactAxisPointer(),
      xAxis: {
        type: "category",
        data: categories,
        axisLabel: axisLabelStyle(theme),
        splitLine: splitLineStyle(theme),
      },
      yAxis: {
        type: "value",
        max: maxValue,
        axisLabel: axisLabelStyle(theme),
        splitLine: splitLineStyle(theme),
      },
      series: [
        {
          type: "pictorialBar",
          symbol: defaultSymbol,
          symbolRepeat,
          symbolClip: true,
          symbolSize: [12, 4],
          symbolMargin: 1,
          barGap,
          barCategoryGap: "30%",
          data: seriesData,
          label: {
            show: true,
            position: "top",
            fontSize: 11,
            fontWeight: 600,
            color: axisLabelStyle(theme).color,
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
    mergeOption,
    formatItemHover: (params) => {
      const mouse = params.event?.event;
      if (!mouse || params.name == null) return null;
      const value = typeof params.value === "number" ? params.value : 0;
      const share = maxValue > 0 ? ((value / maxValue) * 100).toFixed(1) : "0";
      return {
        title: params.name,
        rows: [
          { label: "Value", value: String(value), color: params.color },
          { label: "Capacity", value: `${share}%` },
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
