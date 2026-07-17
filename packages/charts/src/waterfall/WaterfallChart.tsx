"use client";

import type { ReactElement } from "react";
import {
  EChartsWaterfall,
  type WaterfallItem,
} from "@axicharts/charts-echarts";
import { formatTick } from "@axicharts/charts-core";
import { useChartLayout } from "../container/ChartLayoutContext";

export type WaterfallChartProps = {
  items: WaterfallItem[];
  valueFormat?: "currency" | "number" | "compact";
};

export function WaterfallChart({
  items,
  valueFormat = "currency",
}: WaterfallChartProps): ReactElement | null {
  const { size, ready, theme } = useChartLayout();

  if (!ready || size.width < 1 || size.height < 1) {
    return null;
  }

  return (
    <EChartsWaterfall
      width={Math.floor(size.width)}
      height={Math.floor(size.height)}
      items={items}
      theme={theme}
      valueFormat={(value) => formatTick(value, valueFormat)}
    />
  );
}

export type { WaterfallItem } from "@axicharts/charts-echarts";
