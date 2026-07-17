"use client";

import type { ReactElement } from "react";
import type { EChartsOption } from "echarts";
import type { ChartTheme } from "@axicharts/charts-theme";
import {
  axisLabelStyle,
  gridOptions,
  splitLineStyle,
  toneColor,
  tooltipStyle,
} from "./themeBridge";
import { useEChart } from "./useEChart";
import type { WaterfallItem } from "./types";

export type EChartsWaterfallProps = {
  width: number;
  height: number;
  items: WaterfallItem[];
  theme: ChartTheme;
  valueFormat?: (value: number) => string;
};

function buildWaterfallSeries(items: WaterfallItem[]) {
  const placeholders: number[] = [];
  const values: number[] = [];
  const colors: string[] = [];
  const labels: string[] = [];
  let running = 0;

  for (const item of items) {
    labels.push(item.name);

    if (item.isTotal) {
      placeholders.push(0);
      values.push(running);
      colors.push(toneColor(item.tone ?? "default"));
      running = item.value;
      continue;
    }

    const delta = item.value;
    if (delta >= 0) {
      placeholders.push(running);
      values.push(delta);
      colors.push(toneColor(item.tone ?? "success"));
      running += delta;
    } else {
      placeholders.push(running + delta);
      values.push(Math.abs(delta));
      colors.push(toneColor(item.tone ?? "critical"));
      running += delta;
    }
  }

  return { placeholders, values, colors, labels };
}

export function EChartsWaterfall({
  width,
  height,
  items,
  theme,
  valueFormat = (value) => `${value}`,
}: EChartsWaterfallProps): ReactElement {
  const { placeholders, values, colors, labels } = buildWaterfallSeries(items);

  const option: EChartsOption = {
    grid: gridOptions(theme),
    tooltip: {
      ...tooltipStyle(),
      formatter: (params) => {
        const row = Array.isArray(params) ? params[1] : params;
        if (!row || typeof row.value !== "number") return "";
        return `${row.name}: ${valueFormat(row.value)}`;
      },
    },
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
        data: values.map((value, index) => ({
          value,
          itemStyle: { color: colors[index] },
        })),
      },
    ],
  };

  const rootRef = useEChart({ option, width, height });

  return (
    <div
      ref={rootRef}
      className="axicharts-echarts"
      style={{ width, height, background: "transparent" }}
    />
  );
}
