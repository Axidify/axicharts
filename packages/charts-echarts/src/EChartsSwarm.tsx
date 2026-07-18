"use client";

import type { ReactElement } from "react";
import type { EChartsOption } from "echarts";
import type { ChartTheme } from "@axicharts/charts-theme";
import type { ChartGraphicElement } from "@axicharts/charts-canvas";
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
import {
  resolveSwarmMedian,
  resolveSwarmPoints,
  swarmCategories,
  type SwarmItem,
  type SwarmSeries,
} from "./swarmTypes";

export type EChartsSwarmProps = {
  width: number;
  height: number;
  theme: ChartTheme;
  items?: SwarmItem[];
  series?: SwarmSeries[];
  showAxes?: boolean;
  valueSuffix?: string;
  pointRadius?: number;
  pointOpacity?: number;
  jitterWidth?: number;
  showMedianLine?: boolean;
  animate?: boolean;
  mergeOption?: boolean;
  graphics?: ChartGraphicElement[];
  onItemHover?: (event: EChartItemHoverEvent) => void;
};

function formatValue(value: number, suffix = ""): string {
  const rounded = Math.abs(value) >= 100 ? value.toFixed(0) : value.toFixed(1);
  return `${rounded}${suffix}`;
}

export function EChartsSwarm({
  width,
  height,
  theme,
  items = [],
  series = [],
  showAxes = true,
  valueSuffix = "",
  pointRadius = 4,
  pointOpacity = 0.75,
  jitterWidth = 0.75,
  showMedianLine = false,
  animate = false,
  mergeOption,
  graphics,
  onItemHover,
}: EChartsSwarmProps): ReactElement {
  const palette = seriesPalette(theme);
  const groups =
    series.length > 0
      ? series
      : items.length > 0
        ? [{ name: "Distribution", items }]
        : [];
  const categories = swarmCategories(groups.length > 0 ? groups : items);
  const seriesCount = groups.length;

  const option: EChartsOption = withPresentationAnimation(
    {
      grid: {
        ...gridOptions(theme),
        top: groups.length > 1 ? 28 : gridOptions(theme).top,
      },
      legend:
        groups.length > 1
          ? {
              show: true,
              top: 0,
              textStyle: { color: axisLabelStyle(theme).color, fontSize: 11 },
            }
          : { show: false },
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
      series: groups.flatMap((group, groupIndex) => {
        const color =
          toneColor(group.tone, theme) ?? palette[groupIndex % palette.length]!;
        const groupOffset =
          seriesCount > 1
            ? (groupIndex - (seriesCount - 1) / 2) * 0.22
            : 0;
        const scatterData: Array<{
          name: string;
          value: [number, number];
        }> = [];

        for (const item of group.items) {
          const categoryIndex = categories.indexOf(item.category);
          if (categoryIndex < 0) continue;
          const points = resolveSwarmPoints(
            item,
            `${group.name}:${item.category}`,
            jitterWidth,
          );
          for (const point of points) {
            scatterData.push({
              name: item.category,
              value: [categoryIndex + groupOffset + point.xOffset, point.value],
            });
          }
        }

        const scatterSeries = {
          type: "scatter" as const,
          name: group.name,
          data: scatterData,
          symbolSize: pointRadius * 2,
          itemStyle: {
            color,
            opacity: pointOpacity,
          },
        };

        if (!showMedianLine) {
          return [scatterSeries];
        }

        const medianLine = {
          type: "line" as const,
          name: `${group.name} median`,
          showSymbol: false,
          lineStyle: { color, width: 2, type: "dashed" as const },
          data: group.items
            .map((item) => {
              const categoryIndex = categories.indexOf(item.category);
              const median = resolveSwarmMedian(item);
              if (categoryIndex < 0 || median == null) return null;
              return [categoryIndex + groupOffset, median] as [number, number];
            })
            .filter((entry): entry is [number, number] => entry != null),
          tooltip: { show: false },
        };

        return [scatterSeries, medianLine];
      }),
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

      const category =
        typeof params.name === "string" ? params.name : "Category";
      const raw = params.value;
      const value = Array.isArray(raw) ? Number(raw[1]) : Number(raw);

      return {
        title: category,
        rows: [{ label: "Value", value: formatValue(value, valueSuffix) }],
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
