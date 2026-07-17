"use client";

import type { ReactElement } from "react";
import {
  EChartsCandlestick,
  type OhlcPoint,
} from "@axicharts/charts-echarts";
import { useChartLayout } from "../container/ChartLayoutContext";
import { useEChartsSync } from "../sync/useEChartsSync";

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
  const sync = useEChartsSync();

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
      chartId={sync.chartId}
      onSyncIndex={sync.onSyncIndex}
      syncIndex={sync.syncIndex}
      syncSourceId={sync.syncSourceId}
    />
  );
}

export type { OhlcPoint } from "@axicharts/charts-echarts";
