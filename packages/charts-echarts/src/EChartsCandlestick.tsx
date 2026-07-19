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
  reactAxisPointer,
  splitLineStyle,
  upDownColors,
} from "./themeBridge";
import { buildDataZoom } from "./dataZoom";
import { withPresentationAnimation } from "./presentationAnimation";
import { useEChart, type EChartCursorEvent } from "./useEChart";
import type { OhlcPoint } from "./types";
import {
  buildSessionMarkAreas,
  sessionMarkAreaToECharts,
  type SessionShading,
} from "./candlestickSession";

export type EChartBrushRange = {
  start: number;
  end: number;
};

export type EChartsCandlestickProps = {
  width: number;
  height: number;
  categories: string[];
  data: OhlcPoint[];
  volume?: number[];
  theme: ChartTheme;
  brush?: boolean;
  brushStart?: number;
  brushEnd?: number;
  /** Shade pre-market / after-hours bands when categories are HH:MM timestamps. */
  sessionShading?: SessionShading;
  followerBrushRange?: EChartBrushRange | null;
  chartId?: string;
  onSyncIndex?: (index: number | null) => void;
  syncIndex?: number | null;
  syncSourceId?: string | null;
  onCursor?: (event: EChartCursorEvent) => void;
  onBrushRange?: (range: EChartBrushRange | null) => void;
  mergeOption?: boolean;
  graphics?: ChartGraphicElement[];
  animate?: boolean;
};

function resolveZoomWindow(
  brush: boolean,
  brushStart: number,
  brushEnd: number,
  followerBrushRange: EChartBrushRange | null | undefined,
): { start: number; end: number } {
  if (!brush && followerBrushRange) {
    const start = Math.max(0, Math.min(100, followerBrushRange.start));
    const end = Math.max(0, Math.min(100, followerBrushRange.end));
    if (end > start) {
      return { start, end };
    }
    return { start: 0, end: 100 };
  }
  return { start: brushStart, end: brushEnd };
}

export function EChartsCandlestick({
  width,
  height,
  categories,
  data,
  volume,
  theme,
  brush = false,
  brushStart = 0,
  brushEnd = 100,
  sessionShading,
  followerBrushRange,
  chartId,
  onSyncIndex,
  syncIndex,
  syncSourceId,
  onCursor,
  onBrushRange,
  mergeOption = false,
  animate = false,
  graphics,
}: EChartsCandlestickProps): ReactElement {
  const { up, down } = upDownColors(theme);
  const ohlc = data.map((point) => [point.open, point.close, point.low, point.high]);
  const zoomWindow = resolveZoomWindow(brush, brushStart, brushEnd, followerBrushRange);
  const showZoom = brush || Boolean(followerBrushRange);
  const grid = gridOptions(theme, isCompactTile(width, height));
  const mainGrid = {
    ...grid,
    ...(showZoom && !volume ? { bottom: 40 } : {}),
  };
  const sessionBands = buildSessionMarkAreas(categories, sessionShading ?? false, theme);
  const sessionMarkArea =
    sessionBands.length > 0
      ? {
          silent: true,
          animation: false,
          data: sessionMarkAreaToECharts(categories, sessionBands),
        }
      : undefined;

  const option: EChartsOption = withPresentationAnimation(
    {
      grid: volume
        ? [
            {
              ...mainGrid,
              height: showZoom ? "52%" : "58%",
              bottom: showZoom ? "38%" : "32%",
            },
            { ...grid, top: showZoom ? "68%" : "72%", height: "16%" },
          ]
        : [mainGrid],
      tooltip: hiddenTooltip(),
      axisPointer: {
        link: [{ xAxisIndex: volume ? [0, 1] : [0] }],
        ...reactAxisPointer(),
      },
      ...(showZoom
        ? {
            dataZoom: buildDataZoom({
              withVolume: Boolean(volume),
              theme,
              start: zoomWindow.start,
              end: zoomWindow.end,
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
          markArea: sessionMarkArea,
        },
        ...(volume
          ? [
              {
                type: "bar" as const,
                data: volume.map((value, index) => {
                  const point = data[index];
                  const bullish = point ? point.close >= point.open : true;
                  return {
                    value,
                    itemStyle: {
                      color: bullish ? up : down,
                      opacity: 0.55,
                    },
                  };
                }),
                xAxisIndex: 1,
                yAxisIndex: 1,
              },
            ]
          : []),
      ],
    },
    animate,
  );

  const rootRef = useEChart({
    option,
    graphics,
    width,
    height,
    categories,
    chartId,
    onSyncIndex,
    syncIndex,
    syncSourceId,
    onCursor,
    onBrushRange: brush ? onBrushRange : undefined,
    mergeOption,
  });

  return (
    <div
      ref={rootRef}
      className="axicharts-echarts"
      style={{ width, height, background: "transparent" }}
    />
  );
}
