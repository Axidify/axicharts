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
  splitLineStyle,
  seriesPalette,
  toneColor,
} from "./themeBridge";
import { withPresentationAnimation } from "./presentationAnimation";
import { useEChart, type EChartItemHoverEvent } from "./useEChart";
import {
  ridgeDensityHeight,
  resolveRidgelineDensity,
  resolveRidgelineMedian,
  ridgelineCategories,
  type KdePoint,
  type RidgelineItem,
  type RidgelineSeries,
} from "./ridgelineTypes";

export type EChartsRidgelineProps = {
  width: number;
  height: number;
  theme: ChartTheme;
  items?: RidgelineItem[];
  series?: RidgelineSeries[];
  showAxes?: boolean;
  valueSuffix?: string;
  bandwidth?: number;
  ridgeHeight?: number;
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

function createRidgelineRenderItem({
  color,
  ridgeHeightRatio,
  showMedianLine,
}: {
  color: string;
  ridgeHeightRatio: number;
  showMedianLine: boolean;
}) {
  return (
    _params: CustomSeriesRenderItemParams,
    api: CustomSeriesRenderItemAPI,
  ) => {
    const categoryIndex = api.value(0) as number;
    const kdePoints = api.value(1) as unknown as KdePoint[];
    const median = api.value(2) as number | null;

    if (!kdePoints.length) {
      return null;
    }

    const bandHeight = api.size
      ? ((api.size([0, 1]) as number[])[1] ?? 1)
      : 1;
    const baselineY = api.coord([kdePoints[0]!.value, categoryIndex])[1]!;
    const maxDensity = Math.max(...kdePoints.map((point) => point.density), 1e-9);

    const top: [number, number][] = [];
    for (const point of kdePoints) {
      const x = api.coord([point.value, categoryIndex])[0]!;
      const height = ridgeDensityHeight(
        point.density,
        maxDensity,
        bandHeight,
        ridgeHeightRatio,
      );
      top.push([x, baselineY - height]);
    }

    const baselineLeft = api.coord([kdePoints[0]!.value, categoryIndex])[0]!;
    const baselineRight =
      api.coord([kdePoints[kdePoints.length - 1]!.value, categoryIndex])[0]!;
    const polygonPoints: [number, number][] = [
      [baselineLeft, baselineY],
      ...top,
      [baselineRight, baselineY],
    ];

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
        ...(median != null && showMedianLine
          ? [
              {
                type: "line" as const,
                shape: {
                  x1: api.coord([median, categoryIndex])[0]!,
                  y1: baselineY,
                  x2: api.coord([median, categoryIndex])[0]!,
                  y2:
                    baselineY -
                    ridgeDensityHeight(
                      maxDensity * 0.6,
                      maxDensity,
                      bandHeight,
                      ridgeHeightRatio,
                    ),
                },
                style: { stroke: color, lineWidth: 2 },
              },
            ]
          : []),
      ],
    };
  };
}

export function EChartsRidgeline({
  width,
  height,
  theme,
  items = [],
  series = [],
  showAxes = true,
  valueSuffix = "",
  bandwidth,
  ridgeHeight = 0.85,
  showMedianLine = false,
  animate = false,
  mergeOption,
  graphics,
  onItemHover,
}: EChartsRidgelineProps): ReactElement {
  const palette = seriesPalette(theme);
  const groups =
    series.length > 0
      ? series
      : items.length > 0
        ? [{ name: "Distribution", items }]
        : [];
  const categories = ridgelineCategories(groups.length > 0 ? groups : items);

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
        type: "value",
        show: showAxes,
        axisLabel: axisLabelStyle(theme),
        splitLine: splitLineStyle(theme),
      },
      yAxis: {
        type: "category",
        data: categories,
        inverse: true,
        show: showAxes,
        axisLabel: axisLabelStyle(theme),
        splitLine: { show: false },
      },
      series: groups.map((group, groupIndex) => {
        const color =
          toneColor(group.tone, theme) ?? palette[groupIndex % palette.length]!;
        return {
          type: "custom" as const,
          name: group.name,
          renderItem: createRidgelineRenderItem({
            color,
            ridgeHeightRatio: ridgeHeight,
            showMedianLine,
          }),
          data: group.items.map((item) => {
            const categoryIndex = categories.indexOf(item.category);
            return {
              name: item.category,
              value: [
                categoryIndex,
                resolveRidgelineDensity(item, bandwidth),
                resolveRidgelineMedian(item),
              ],
            };
          }),
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
      const median = Array.isArray(raw) ? (raw[2] as number | null) : null;
      const rows =
        median != null
          ? [{ label: "Median", value: formatValue(median, valueSuffix) }]
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
