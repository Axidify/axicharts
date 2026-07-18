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
} from "./themeBridge";
import { useEChart, type EChartCursorEvent } from "./useEChart";
import type { WaterfallItem } from "./types";
import { buildWaterfallBridge } from "./waterfallBridge";

export type EChartsWaterfallProps = {
  width: number;
  height: number;
  items: WaterfallItem[];
  theme: ChartTheme;
  valueFormat?: (value: number) => string;
  onCursor?: (event: EChartCursorEvent) => void;
};

function connectorLineColor(theme: ChartTheme): string {
  const dark = theme.name === "live" || theme.name === "industrial";
  return dark ? "#64748b" : "#94a3b8";
}

export function EChartsWaterfall({
  width,
  height,
  items,
  theme,
  valueFormat = (value) => `${value}`,
  onCursor,
}: EChartsWaterfallProps): ReactElement {
  const { placeholders, values, colors, labels, connectors } =
    buildWaterfallBridge(items, theme);

  const option: EChartsOption = {
    grid: gridOptions(theme),
    tooltip: hiddenTooltip(),
    axisPointer: reactAxisPointer(),
    xAxis: {
      type: "category",
      data: labels,
      axisLabel: axisLabelStyle(theme),
      splitLine: splitLineStyle(theme),
    },
    yAxis: {
      type: "value",
      axisLabel: axisLabelStyle(theme),
      splitLine: splitLineStyle(theme),
    },
    series: [
      {
        type: "bar",
        stack: "waterfall",
        itemStyle: { borderColor: "transparent", color: "transparent" },
        emphasis: { itemStyle: { borderColor: "transparent", color: "transparent" } },
        data: placeholders,
      },
      {
        type: "bar",
        stack: "waterfall",
        label: {
          show: true,
          position: "top",
          formatter: ({ value }) => valueFormat(Number(value)),
          fontSize: 11,
        },
        markLine: {
          symbol: ["none", "none"],
          silent: true,
          animation: false,
          lineStyle: {
            color: connectorLineColor(theme),
            width: 1,
            type: "solid",
          },
          data: connectors,
        },
        data: values.map((value, index) => ({
          value,
          itemStyle: { color: colors[index] },
        })),
      },
    ],
  };

  const rootRef = useEChart({
    option,
    width,
    height,
    categories: labels,
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
