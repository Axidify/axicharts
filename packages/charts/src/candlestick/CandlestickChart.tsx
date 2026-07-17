"use client";

import type { ReactElement } from "react";
import {
  EChartsCandlestick,
  type OhlcPoint,
} from "@axicharts/charts-echarts";
import { useChartLayout } from "../container/ChartLayoutContext";

export type CandlestickChartProps = {
  categories: string[];
  data: OhlcPoint[];
  volume?: number[];
};

export function CandlestickChart({
  categories,
  data,
  volume,
}: CandlestickChartProps): ReactElement | null {
  const { size, ready, theme } = useChartLayout();

  if (!ready || size.width < 1 || size.height < 1) {
    return null;
  }

  return (
    <EChartsCandlestick
      width={Math.floor(size.width)}
      height={Math.floor(size.height)}
      categories={categories}
      data={data}
      volume={volume}
      theme={theme}
    />
  );
}

export type { OhlcPoint } from "@axicharts/charts-echarts";
