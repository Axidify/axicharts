"use client";

import type { ReactElement } from "react";
import type {
  CustomSeriesRenderItemAPI,
  CustomSeriesRenderItemParams,
  EChartsOption,
} from "echarts";
import type { ChartTheme } from "@axicharts/charts-theme";
import type { ChartGraphicElement } from "@axicharts/charts-canvas";
import { resolveDistributionNicheLayout } from "./nicheCompactLayout";
import {
  axisLabelStyle,
  gridOptions,
  hiddenTooltip,
  isCompactTile,
  itemEmphasisOptions,
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
import { kdeValueExtent } from "./kdeExtent";

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

/**
 * Per-item ridge data, looked up by `dataIndex`. ECharts stores custom series
 * `value` dimensions as numbers, so the KDE array can't ride along in `value`.
 */
type RidgeShape = { kdePoints: KdePoint[]; median: number | null };

function createRidgelineRenderItem({
  shapes,
  color,
  ridgeHeightRatio,
  showMedianLine,
  medianLineWidth,
}: {
  shapes: RidgeShape[];
  color: string;
  ridgeHeightRatio: number;
  showMedianLine: boolean;
  medianLineWidth: number;
}) {
  return (
    params: CustomSeriesRenderItemParams,
    api: CustomSeriesRenderItemAPI,
  ) => {
    // value = [x anchor on the value axis, category index on the y axis]
    const categoryIndex = api.value(1) as number;
    const shape = shapes[params.dataIndex];
    if (!shape) return null;
    const { kdePoints, median } = shape;

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
                style: { stroke: color, lineWidth: medianLineWidth },
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
  const compact = isCompactTile(width, height);
  const layout = resolveDistributionNicheLayout(width, height, groups.length);
  const grid = gridOptions(theme, compact);
  const axisStyle = {
    ...axisLabelStyle(theme),
    fontSize: layout.axisFontSize,
  };

  const groupShapes: RidgeShape[][] = groups.map((group) =>
    group.items.map((item) => ({
      kdePoints: resolveRidgelineDensity(item, bandwidth),
      median: resolveRidgelineMedian(item),
    })),
  );
  const valueExtent = kdeValueExtent(groupShapes.flat());

  const option: EChartsOption = withPresentationAnimation(
    {
      grid: {
        ...grid,
        top: layout.gridTop ?? (groups.length > 1 ? 28 : grid.top),
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
        ...valueExtent,
        show: showAxes,
        axisLabel: axisStyle,
        splitLine: splitLineStyle(theme),
      },
      yAxis: {
        type: "category",
        data: categories,
        inverse: true,
        show: showAxes,
        axisLabel: {
          ...axisStyle,
          show: showAxes && !layout.hideCategoryAxisLabels,
        },
        splitLine: { show: false },
      },
      series: groups.map((group, groupIndex) => {
        const color =
          toneColor(group.tone, theme) ?? palette[groupIndex % palette.length]!;
        const shapes = groupShapes[groupIndex]!;
        return {
          type: "custom" as const,
          name: group.name,
          renderItem: createRidgelineRenderItem({
            shapes,
            color,
            ridgeHeightRatio: ridgeHeight,
            showMedianLine,
            medianLineWidth: theme.line.strokeWidth,
          }),
          data: group.items.map((item, itemIndex) => {
            const shape = shapes[itemIndex]!;
            // x must be a real value-axis number or ECharts drops the item
            // before renderItem runs; the shape itself comes from `shapes`.
            const anchor = shape.median ?? shape.kdePoints[0]?.value ?? 0;
            return {
              name: item.category,
              value: [anchor, categories.indexOf(item.category)],
              median: shape.median,
            };
          }),
          emphasis: itemEmphasisOptions(theme),
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
      const median =
        (params.data as { median?: number | null } | undefined)?.median ?? null;
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
