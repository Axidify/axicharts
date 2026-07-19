"use client";

import type { ReactElement } from "react";
import type { EChartsOption } from "echarts";
import type { ChartTheme } from "@axicharts/charts-theme";
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
import { resolveScatterAxisLayout } from "./scatterLabels";
import {
  bubbleSizeExtent,
  bubbleSymbolSize,
  DEFAULT_BUBBLE_SIZE_RANGE,
  DEFAULT_SCATTER_SYMBOL_SIZE,
} from "./scatterSize";
import type { ChartGraphicElement } from "@axicharts/charts-canvas";
import type { ScatterSeries } from "./scatterTypes";

export type EChartsScatterProps = {
  width: number;
  height: number;
  series: ScatterSeries[];
  theme: ChartTheme;
  showAxes?: boolean;
  showPointLabels?: boolean;
  showSizeLegend?: boolean;
  xLabel?: string;
  yLabel?: string;
  xSuffix?: string;
  ySuffix?: string;
  sizeRange?: [number, number];
  animate?: boolean;
  mergeOption?: boolean;
  graphics?: ChartGraphicElement[];
  onItemHover?: (event: EChartItemHoverEvent) => void;
};

function formatCoord(value: number, suffix = ""): string {
  const rounded =
    Math.abs(value) >= 100 ? value.toFixed(0) : value.toFixed(1);
  return `${rounded}${suffix}`;
}

function seriesHasBubbleSizes(items: ScatterSeries[]): boolean {
  return items.some((item) =>
    item.points.some((point) => typeof point.size === "number"),
  );
}

export function EChartsScatter({
  width,
  height,
  series,
  theme,
  showAxes = true,
  showPointLabels = false,
  showSizeLegend = false,
  xLabel,
  yLabel,
  xSuffix = "",
  ySuffix = "",
  sizeRange = DEFAULT_BUBBLE_SIZE_RANGE,
  animate = false,
  mergeOption,
  graphics,
  onItemHover,
}: EChartsScatterProps): ReactElement {
  const showLegend = series.length > 1;
  const pointCount = series.reduce((total, item) => total + item.points.length, 0);
  const hasBubbleSizes = seriesHasBubbleSizes(series);
  const layout = resolveScatterAxisLayout(width, height, {
    pointCount,
    showLegend,
    showPointLabels,
    xLabel,
    yLabel,
  });
  const baseGrid = gridOptions(theme, layout.compact);
  const grid = {
    ...baseGrid,
    top: layout.gridTop,
    bottom: layout.gridBottom,
    left: layout.gridLeft,
    right: showSizeLegend && hasBubbleSizes ? 56 : baseGrid.right,
  };

  const axisNameStyle = axisLabelStyle(theme);
  const axisLabel = {
    ...axisNameStyle,
    fontSize: layout.axisFontSize,
  };
  const nameTextStyle = {
    ...axisNameStyle,
    fontSize: layout.nameFontSize,
  };
  const palette = seriesPalette(theme);
  const bubbleExtent = bubbleSizeExtent(series);

  const option: EChartsOption = withPresentationAnimation(
    {
    grid,
    legend: showLegend
      ? {
          show: true,
          top: 0,
          textStyle: { color: axisNameStyle.color, fontSize: layout.compact ? 10 : 11 },
        }
      : { show: false },
    tooltip: hiddenTooltip(),
    visualMap:
      showSizeLegend && hasBubbleSizes
        ? {
            show: true,
            type: "continuous",
            dimension: 2,
            min: bubbleExtent.min,
            max: bubbleExtent.max,
            inRange: {
              symbolSize: sizeRange,
            },
            calculable: false,
            orient: "vertical",
            right: 4,
            top: "middle",
            itemWidth: 10,
            itemHeight: layout.compact ? 56 : 72,
            textStyle: {
              color: axisNameStyle.color,
              fontSize: layout.compact ? 9 : 10,
            },
            text: ["Large", "Small"],
          }
        : undefined,
    xAxis: {
      type: "value",
      scale: true,
      show: showAxes,
      name: xLabel,
      nameLocation: "middle",
      nameGap: layout.xNameGap,
      nameTextStyle,
      axisLabel,
      splitLine: splitLineStyle(theme),
    },
    yAxis: {
      type: "value",
      scale: true,
      show: showAxes,
      name: yLabel,
      nameLocation: "middle",
      nameGap: layout.yNameGap,
      nameRotate: 90,
      nameTextStyle,
      axisLabel,
      splitLine: splitLineStyle(theme),
    },
    series: series.map((item, index) => ({
      type: "scatter" as const,
      name: item.name,
      data: item.points.map((point) => ({
        value:
          typeof point.size === "number"
            ? [point.x, point.y, point.size]
            : [point.x, point.y],
        name: point.label,
      })),
      symbolSize: (value: unknown) =>
        bubbleSymbolSize(value, DEFAULT_SCATTER_SYMBOL_SIZE),
      itemStyle: {
        color:
          toneColor(item.tone, theme) ?? palette[index % palette.length],
      },
      emphasis: {
        scale: 1.2,
      },
      label: showPointLabels
        ? {
            show: true,
            position: "top",
            fontSize: layout.labelFontSize,
            color: axisNameStyle.color,
            minMargin: 2,
            formatter: (params: { name?: string }) => params.name ?? "",
          }
        : { show: false },
      labelLayout: showPointLabels
        ? {
            hideOverlap: layout.hideOverlap,
            moveOverlap: layout.labelDensity === "crowded" ? "shiftY" : undefined,
          }
        : undefined,
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
    mergeOption: mergeOption ?? !animate,
    formatItemHover: (params) => {
      const mouse = params.event?.event;
      if (!mouse) return null;

      const raw = params.value;
      const coords = Array.isArray(raw) ? raw : [];
      const x = typeof coords[0] === "number" ? coords[0] : 0;
      const y = typeof coords[1] === "number" ? coords[1] : 0;
      const size = typeof coords[2] === "number" ? coords[2] : undefined;
      const title =
        typeof params.name === "string" && params.name
          ? params.name
          : "Point";

      const rows = [
        {
          label: "X",
          value: formatCoord(x, xSuffix),
          color: params.color,
        },
        {
          label: "Y",
          value: formatCoord(y, ySuffix),
        },
      ];

      if (size != null) {
        rows.push({
          label: "Size",
          value: formatCoord(size),
        });
      }

      return {
        title,
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
