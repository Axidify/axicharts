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
import { withPresentationAnimation } from "./presentationAnimation";
import { useEChart, type EChartCursorEvent } from "./useEChart";
import type { WaterfallItem } from "./types";
import { buildWaterfallBridge } from "./waterfallBridge";

export type EChartsWaterfallProps = {
  width: number;
  height: number;
  items: WaterfallItem[];
  theme: ChartTheme;
  valueFormat?: (value: number) => string;
  showLabels?: boolean;
  /** Prefix +/- on delta bar labels (IBCS). */
  showSigns?: boolean;
  connectorStyle?: "solid" | "dashed";
  animate?: boolean;
  mergeOption?: boolean;
  onCursor?: (event: EChartCursorEvent) => void;
};

function connectorLineColor(theme: ChartTheme): string {
  const dark = theme.name === "live" || theme.name === "industrial";
  return dark ? "#64748b" : "#94a3b8";
}

function formatWaterfallLabel(
  displayValue: number,
  isTotal: boolean,
  showSigns: boolean,
  valueFormat: (value: number) => string,
): string {
  if (isTotal || !showSigns) {
    return valueFormat(displayValue);
  }
  const sign = displayValue > 0 ? "+" : displayValue < 0 ? "−" : "";
  return `${sign}${valueFormat(Math.abs(displayValue))}`;
}

export function EChartsWaterfall({
  width,
  height,
  items,
  theme,
  valueFormat = (value) => `${value}`,
  showLabels = true,
  showSigns = true,
  connectorStyle = "dashed",
  animate = false,
  mergeOption,
  onCursor,
}: EChartsWaterfallProps): ReactElement {
  const bridge = buildWaterfallBridge(items, theme);
  const { placeholders, values, colors, labels, connectors, displayValues, isTotals } =
    bridge;

  const option: EChartsOption = withPresentationAnimation(
    {
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
        emphasis: {
          itemStyle: { borderColor: "transparent", color: "transparent" },
        },
        data: placeholders,
      },
      {
        type: "bar",
        stack: "waterfall",
        barMaxWidth: 56,
        label: {
          show: showLabels,
          position: "top",
          formatter: (params) => {
            const index = params.dataIndex ?? 0;
            return formatWaterfallLabel(
              displayValues[index] ?? 0,
              isTotals[index] ?? false,
              showSigns,
              valueFormat,
            );
          },
          fontSize: 11,
          fontWeight: 600,
        },
        markLine: {
          symbol: ["none", "none"],
          silent: true,
          animation: false,
          lineStyle: {
            color: connectorLineColor(theme),
            width: 1,
            type: connectorStyle,
          },
          data: connectors,
        },
        data: values.map((value, index) => {
          const total = isTotals[index];
          const color = colors[index]!;
          const dark = theme.name === "live" || theme.name === "industrial";
          return {
            value,
            label: showLabels
              ? {
                  position: total ? ("inside" as const) : ("top" as const),
                  color: total ? "#f8fafc" : dark ? "#e2e8f0" : "#334155",
                }
              : { show: false },
            itemStyle: {
              color,
              borderColor: total ? "#1e293b" : color,
              borderWidth: total ? 1.5 : 0,
              borderRadius: total ? [4, 4, 4, 4] : [4, 4, 0, 0],
              opacity: total ? 1 : 0.92,
            },
          };
        }),
      },
    ],
  },
    animate,
  );

  const rootRef = useEChart({
    option,
    width,
    height,
    categories: labels,
    onCursor,
    mergeOption: mergeOption ?? !animate,
  });

  return (
    <div
      ref={rootRef}
      className="axicharts-echarts"
      style={{ width, height, background: "transparent" }}
    />
  );
}
