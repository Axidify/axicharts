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
import { buildDataZoom } from "./dataZoom";
import { useEChart, type EChartCursorEvent } from "./useEChart";
import type { OhlcPoint } from "./types";

export type EChartsCandlestickProps = {
  width: number;
  height: number;
  categories: string[];
  data: OhlcPoint[];
  volume?: number[];
  theme: ChartTheme;
  brush?: boolean;
  brushEnd?: number;
  chartId?: string;
  onSyncIndex?: (index: number | null) => void;
  syncIndex?: number | null;
  syncSourceId?: string | null;
  onCursor?: (event: EChartCursorEvent) => void;
  onBrushRange?: (range: { start: number; end: number } | null) => void;
};

export function EChartsCandlestick({
  width,
  height,
  categories,
  data,
  volume,
  theme,
  brush = false,
  brushEnd,
  chartId,
  onSyncIndex,
  syncIndex,
  syncSourceId,
  onCursor,
  onBrushRange,
}: EChartsCandlestickProps): ReactElement {
  const { up, down } = upDownColors(theme);
  const ohlc = data.map((point) => [point.open, point.close, point.low, point.high]);
  const mainGrid = {
    ...gridOptions(theme),
    ...(brush && !volume ? { bottom: 40 } : {}),
  };

  const option: EChartsOption = {
    grid: volume
      ? [
          { ...mainGrid, height: brush ? "52%" : "58%", bottom: brush ? "38%" : "32%" },
          { ...gridOptions(theme), top: brush ? "68%" : "72%", height: "16%" },
        ]
      : [mainGrid],
    tooltip: hiddenTooltip(),
    axisPointer: {
      link: [{ xAxisIndex: volume ? [0, 1] : [0] }],
      ...reactAxisPointer(),
    },
    ...(brush
      ? {
          dataZoom: buildDataZoom({
            withVolume: Boolean(volume),
            theme,
            end: brushEnd,
          }),
        }
      : {}),
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
    onBrushRange,
  });

  return (
    <div
      ref={rootRef}
      className="axicharts-echarts"
      style={{ width, height, background: "transparent" }}
    />
  );
}
