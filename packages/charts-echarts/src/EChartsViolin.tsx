"use client";

import type { ReactElement } from "react";
import type {
  CustomSeriesRenderItemAPI,
  CustomSeriesRenderItemParams,
  EChartsOption,
} from "echarts";
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
import {
  resolveViolinBoxStats,
  resolveViolinDensity,
  violinCategories,
  type KdePoint,
  type ViolinBoxStats,
  type ViolinItem,
  type ViolinSeries,
} from "./violinTypes";

export type EChartsViolinProps = {
  width: number;
  height: number;
  theme: ChartTheme;
  items?: ViolinItem[];
  series?: ViolinSeries[];
  showAxes?: boolean;
  valueSuffix?: string;
  bandwidth?: number;
  showBoxplot?: boolean;
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

function createViolinRenderItem({
  color,
  seriesCount,
  seriesIndex,
  showBoxplot,
  showMedianLine,
}: {
  color: string;
  seriesCount: number;
  seriesIndex: number;
  showBoxplot: boolean;
  showMedianLine: boolean;
}) {
  return (
    _params: CustomSeriesRenderItemParams,
    api: CustomSeriesRenderItemAPI,
  ) => {
    const categoryIndex = api.value(0) as number;
    const kdePoints = api.value(1) as unknown as KdePoint[];
    const stats = api.value(2) as unknown as ViolinBoxStats | null;

    if (!kdePoints.length) {
      return null;
    }

    const center = api.coord([categoryIndex, kdePoints[0]!.value]) as [
      number,
      number,
    ];
    const bandWidth = api.size
      ? ((api.size([1, 0]) as number[])[0] ?? 1)
      : 1;
    const groupOffset =
      seriesCount > 1
        ? (seriesIndex - (seriesCount - 1) / 2) * bandWidth * 0.25
        : 0;
    const centerX = center[0] + groupOffset;
    const maxHalfWidth = (bandWidth * 0.4) / Math.max(seriesCount, 1);
    const maxDensity = Math.max(...kdePoints.map((point) => point.density), 1e-9);

    const left: [number, number][] = [];
    const right: [number, number][] = [];

    for (const point of kdePoints) {
      const y = api.coord([categoryIndex, point.value])[1]!;
      const halfWidth = (point.density / maxDensity) * maxHalfWidth;
      left.push([centerX - halfWidth, y]);
      right.push([centerX + halfWidth, y]);
    }

    const polygonPoints = [...left, ...[...right].reverse()];

    return {
      type: "group" as const,
      children: [
        {
          type: "polygon" as const,
          shape: { points: polygonPoints },
          style: {
            fill: color,
            opacity: 0.55,
            stroke: color,
            lineWidth: 1,
          },
        },
        ...(stats && showMedianLine
          ? [
              {
                type: "line" as const,
                shape: {
                  x1: centerX - maxHalfWidth * 0.35,
                  y1: api.coord([categoryIndex, stats.median])[1]!,
                  x2: centerX + maxHalfWidth * 0.35,
                  y2: api.coord([categoryIndex, stats.median])[1]!,
                },
                style: { stroke: color, lineWidth: 2 },
              },
            ]
          : []),
        ...(stats && showBoxplot
          ? [
              {
                type: "line" as const,
                shape: {
                  x1: centerX,
                  y1: api.coord([categoryIndex, stats.min])[1]!,
                  x2: centerX,
                  y2: api.coord([categoryIndex, stats.max])[1]!,
                },
                style: { stroke: color, lineWidth: 1 },
              },
              {
                type: "rect" as const,
                shape: {
                  x: centerX - maxHalfWidth * 0.09,
                  y: api.coord([categoryIndex, stats.q3])[1]!,
                  width: maxHalfWidth * 0.18,
                  height:
                    api.coord([categoryIndex, stats.q1])[1]! -
                    api.coord([categoryIndex, stats.q3])[1]!,
                },
                style: {
                  fill: color,
                  opacity: 0.85,
                  stroke: color,
                  lineWidth: 1,
                },
              },
            ]
          : []),
      ],
    };
  };
}

export function EChartsViolin({
  width,
  height,
  theme,
  items = [],
  series = [],
  showAxes = true,
  valueSuffix = "",
  bandwidth,
  showBoxplot = true,
  showMedianLine = false,
  animate = false,
  mergeOption,
  graphics,
  onItemHover,
}: EChartsViolinProps): ReactElement {
  const palette = seriesPalette(theme);
  const groups =
    series.length > 0
      ? series
      : items.length > 0
        ? [{ name: "Distribution", items }]
        : [];
  const categories = violinCategories(groups.length > 0 ? groups : items);
  const compact = isCompactTile(width, height);
  const grid = gridOptions(theme, compact);

  const option: EChartsOption = withPresentationAnimation(
    {
      grid: {
        ...grid,
        top: groups.length > 1 ? 28 : grid.top,
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
      series: groups.map((group, groupIndex) => {
        const color =
          toneColor(group.tone, theme) ?? palette[groupIndex % palette.length]!;
        return {
          type: "custom" as const,
          name: group.name,
          renderItem: createViolinRenderItem({
            color,
            seriesCount: groups.length,
            seriesIndex: groupIndex,
            showBoxplot,
            showMedianLine,
          }),
          data: group.items.map((item, categoryIndex) => ({
            name: item.category,
            value: [
              categoryIndex,
              resolveViolinDensity(item, bandwidth),
              resolveViolinBoxStats(item),
            ],
          })),
        };
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
      const stats = Array.isArray(raw) ? (raw[2] as ViolinBoxStats | null) : null;
      const rows = stats
        ? [
            { label: "Min", value: formatValue(stats.min, valueSuffix) },
            { label: "Q1", value: formatValue(stats.q1, valueSuffix) },
            { label: "Median", value: formatValue(stats.median, valueSuffix) },
            { label: "Q3", value: formatValue(stats.q3, valueSuffix) },
            { label: "Max", value: formatValue(stats.max, valueSuffix) },
          ]
        : [{ label: "Category", value: category }];

      return {
        title: category,
        rows,
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
