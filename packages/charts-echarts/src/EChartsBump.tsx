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
  seriesPalette,
  splitLineStyle,
  toneColor,
} from "./themeBridge";
import { withPresentationAnimation } from "./presentationAnimation";
import { useEChart, type EChartItemHoverEvent } from "./useEChart";
import type { BumpChartData } from "./bumpTypes";

export type EChartsBumpProps = {
  width: number;
  height: number;
  theme: ChartTheme;
  data: BumpChartData;
  maxRank?: number;
  showLabels?: boolean;
  showAxes?: boolean;
  smooth?: boolean;
  onItemHover?: (event: EChartItemHoverEvent) => void;
  mergeOption?: boolean;
  graphics?: ChartGraphicElement[];
  animate?: boolean;
};

function resolveMaxRank(data: BumpChartData, maxRank?: number): number {
  if (maxRank != null && Number.isFinite(maxRank)) {
    return Math.max(1, Math.round(maxRank));
  }

  const fromData = data.series.reduce(
    (max, item) => Math.max(max, ...item.ranks),
    0,
  );
  return Math.max(fromData, data.series.length, 1);
}

export function EChartsBump({
  width,
  height,
  theme,
  data,
  maxRank,
  showLabels = true,
  showAxes = true,
  smooth = true,
  onItemHover,
  mergeOption = false,
  animate = false,
  graphics,
}: EChartsBumpProps): ReactElement {
  const palette = seriesPalette(theme);
  const labelStyle = axisLabelStyle(theme);
  const resolvedMaxRank = resolveMaxRank(data, maxRank);
  const labelRoom = showLabels ? Math.min(96, Math.max(56, width * 0.18)) : 16;
  const grid = gridOptions(theme, isCompactTile(width, height));

  const option: EChartsOption = withPresentationAnimation(
    {
      tooltip: hiddenTooltip(),
      grid: {
        ...grid,
        right: labelRoom,
      },
      xAxis: {
        type: "category",
        data: data.categories,
        show: showAxes,
        boundaryGap: false,
        axisLabel: labelStyle,
        axisLine: {
          lineStyle: {
            color: splitLineStyle(theme).lineStyle.color,
            opacity: theme.grid.opacity,
          },
        },
      },
      yAxis: {
        type: "value",
        inverse: true,
        min: 1,
        max: resolvedMaxRank,
        interval: 1,
        show: showAxes,
        axisLabel: labelStyle,
        splitLine: splitLineStyle(theme),
      },
      series: data.series.map((item, index) => ({
        type: "line",
        name: item.name,
        data: item.ranks,
        smooth,
        symbol: "circle",
        symbolSize: 6,
        lineStyle: { width: 2 },
        itemStyle: {
          color:
            item.color ??
            toneColor(item.tone, theme) ??
            palette[index % palette.length],
        },
        endLabel: showLabels
          ? {
              show: true,
              formatter: () => item.name,
              distance: 8,
              color: labelStyle.color,
              fontSize: 11,
            }
          : { show: false },
        emphasis: {
          focus: "series",
        },
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
    formatItemHover: (rawParams) => {
      const params = rawParams as typeof rawParams & {
        seriesName?: string;
        dataIndex?: number;
      };
      const mouse = params.event?.event;
      const seriesName = params.seriesName ?? params.name;
      if (!mouse || seriesName == null || params.dataIndex == null) {
        return null;
      }

      const period = data.categories[params.dataIndex] ?? String(params.dataIndex);
      const rank = params.value ?? params.data;

      return {
        title: String(seriesName),
        rows: [
          { label: "Period", value: String(period), color: params.color },
          { label: "Rank", value: String(rank), color: params.color },
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
