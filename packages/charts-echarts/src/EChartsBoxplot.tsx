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
  itemEmphasisOptions,
  splitLineStyle,
  seriesPalette,
  toneColor,
} from "./themeBridge";
import { withPresentationAnimation } from "./presentationAnimation";
import { useEChart, type EChartItemHoverEvent } from "./useEChart";
import {
  boxplotCategories,
  boxplotTuple,
  type BoxplotItem,
  type BoxplotSeries,
} from "./boxplotTypes";
import { resolveDistributionNicheLayout } from "./nicheCompactLayout";

export type EChartsBoxplotProps = {
  width: number;
  height: number;
  theme: ChartTheme;
  items?: BoxplotItem[];
  series?: BoxplotSeries[];
  showAxes?: boolean;
  valueSuffix?: string;
  animate?: boolean;
  mergeOption?: boolean;
  graphics?: ChartGraphicElement[];
  onItemHover?: (event: EChartItemHoverEvent) => void;
};

function formatValue(value: number, suffix = ""): string {
  const rounded = Math.abs(value) >= 100 ? value.toFixed(0) : value.toFixed(1);
  return `${rounded}${suffix}`;
}

export function EChartsBoxplot({
  width,
  height,
  theme,
  items = [],
  series = [],
  showAxes = true,
  valueSuffix = "",
  animate = false,
  mergeOption,
  graphics,
  onItemHover,
}: EChartsBoxplotProps): ReactElement {
  const palette = seriesPalette(theme);
  const groups =
    series.length > 0
      ? series
      : items.length > 0
        ? [{ name: "Distribution", items }]
        : [];
  const categories = boxplotCategories(
    groups.length > 0 ? groups : items,
  );
  const compact = isCompactTile(width, height);
  const layout = resolveDistributionNicheLayout(width, height, groups.length);
  const grid = gridOptions(theme, compact);
  const axisStyle = {
    ...axisLabelStyle(theme),
    fontSize: layout.axisFontSize,
  };

  const option: EChartsOption = withPresentationAnimation(
    {
    grid: {
      ...grid,
      top: layout.gridTop ?? grid.top,
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
      axisLabel: axisStyle,
      splitLine: { show: false },
    },
    yAxis: {
      type: "value",
      show: showAxes,
      axisLabel: {
        ...axisStyle,
        show: showAxes && !layout.hideYAxisLabels,
      },
      splitLine: splitLineStyle(theme),
    },
    series: groups.map((group, index) => ({
      type: "boxplot" as const,
      name: group.name,
      data: group.items.map((item) => boxplotTuple(item)),
      itemStyle: {
        color:
          toneColor(group.tone, theme) ?? palette[index % palette.length],
        borderColor:
          toneColor(group.tone, theme) ?? palette[index % palette.length],
      },
      emphasis: itemEmphasisOptions(theme),
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
      const stats = Array.isArray(raw) ? raw : [];
      const category =
        typeof params.name === "string" ? params.name : "Category";

      return {
        title: category,
        rows: [
          { label: "Min", value: formatValue(Number(stats[0] ?? 0), valueSuffix) },
          { label: "Q1", value: formatValue(Number(stats[1] ?? 0), valueSuffix) },
          {
            label: "Median",
            value: formatValue(Number(stats[2] ?? 0), valueSuffix),
          },
          { label: "Q3", value: formatValue(Number(stats[3] ?? 0), valueSuffix) },
          { label: "Max", value: formatValue(Number(stats[4] ?? 0), valueSuffix) },
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
