"use client";

import type { ReactElement } from "react";
import type { EChartsOption } from "echarts";
import type { ChartTheme } from "@axicharts/charts-theme";
import {
  axisLabelStyle,
  gridOptions,
  hiddenTooltip,
  reactAxisPointer,
  splitLineStyle,
  upDownColors,
} from "./themeBridge";
import { useEChart, type EChartCursorEvent } from "./useEChart";
import type { OhlcPoint } from "./types";

export type EChartsCandlestickProps = {
  width: number;
  height: number;
  categories: string[];
  data: OhlcPoint[];
  volume?: number[];
  theme: ChartTheme;
  chartId?: string;
  onSyncIndex?: (index: number | null) => void;
  syncIndex?: number | null;
  syncSourceId?: string | null;
  onCursor?: (event: EChartCursorEvent) => void;
};

export function EChartsCandlestick({
  width,
  height,
  categories,
  data,
  volume,
  theme,
  chartId,
  onSyncIndex,
  syncIndex,
  syncSourceId,
  onCursor,
}: EChartsCandlestickProps): ReactElement {
  const { up, down } = upDownColors();
  const ohlc = data.map((point) => [point.open, point.close, point.low, point.high]);

  const option: EChartsOption = {
    grid: volume
      ? [
          { ...gridOptions(theme), height: "58%", bottom: "32%" },
          { ...gridOptions(theme), top: "72%", height: "18%" },
        ]
      : [gridOptions(theme)],
    tooltip: hiddenTooltip(),
    axisPointer: {
      link: [{ xAxisIndex: volume ? [0, 1] : [0] }],
      ...reactAxisPointer(),
    },
    xAxis: volume
      ? [
          {
            type: "category",
            data: categories,
            axisLabel: axisLabelStyle(theme),
            splitLine: splitLineStyle(theme),
            gridIndex: 0,
          },
          {
            type: "category",
            data: categories,
            axisLabel: { show: false },
            gridIndex: 1,
          },
        ]
      : [
          {
            type: "category",
            data: categories,
            axisLabel: axisLabelStyle(theme),
            splitLine: splitLineStyle(theme),
          },
        ],
    yAxis: volume
      ? [
          {
            scale: true,
            axisLabel: axisLabelStyle(theme),
            splitLine: splitLineStyle(theme),
            gridIndex: 0,
          },
          {
            scale: true,
            axisLabel: { show: false },
            splitLine: { show: false },
            gridIndex: 1,
          },
        ]
      : [
          {
            scale: true,
            axisLabel: axisLabelStyle(theme),
            splitLine: splitLineStyle(theme),
          },
        ],
    series: [
      {
        type: "candlestick",
        data: ohlc,
        xAxisIndex: 0,
        yAxisIndex: 0,
        itemStyle: {
          color: up,
          color0: down,
          borderColor: up,
          borderColor0: down,
        },
      },
      ...(volume
        ? [
            {
              type: "bar" as const,
              data: volume,
              xAxisIndex: 1,
              yAxisIndex: 1,
              itemStyle: { color: "#94a3b8" },
            },
          ]
        : []),
    ],
  };

  const rootRef = useEChart({
    option,
    width,
    height,
    categories,
    chartId,
    onSyncIndex,
    syncIndex,
    syncSourceId,
    onCursor,
  });

  return (
    <div
      ref={rootRef}
      className="axicharts-echarts"
      style={{ width, height, background: "transparent" }}
    />
  );
}
