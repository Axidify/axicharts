"use client";

import type { ReactElement } from "react";
import {
  EChartsCandlestick,
  type OhlcPoint,
} from "@axicharts/charts-echarts";
import { useChartLayout } from "../container/ChartLayoutContext";
import {
  CartesianChartShell,
} from "../chrome/CartesianChartShell";
import type { TooltipRow } from "../chrome/Tooltip";
import { formatSeriesValue } from "../chrome/resolveSeries";
import { useEChartsInteraction } from "../sync/useEChartsInteraction";

export type CandlestickChartProps = {
  categories: string[];
  data: OhlcPoint[];
  volume?: number[];
};

function buildOhlcRows(
  point: OhlcPoint,
  volume?: number,
): TooltipRow[] {
  const rows: TooltipRow[] = [
    { label: "Open", value: formatSeriesValue(point.open) },
    { label: "High", value: formatSeriesValue(point.high) },
    { label: "Low", value: formatSeriesValue(point.low) },
    { label: "Close", value: formatSeriesValue(point.close) },
  ];
  if (volume != null) {
    rows.push({ label: "Volume", value: formatSeriesValue(volume) });
  }
  return rows;
}

function CandlestickPlot({
  categories,
  data,
  volume,
}: CandlestickChartProps): ReactElement {
  const { size, theme } = useChartLayout();
  const interaction = useEChartsInteraction();

  return (
    <EChartsCandlestick
      width={Math.floor(size.width)}
      height={Math.floor(size.height)}
      categories={categories}
      data={data}
      volume={volume}
      theme={theme}
      chartId={interaction.chartId}
      onSyncIndex={interaction.onSyncIndex}
      syncIndex={interaction.syncIndex}
      syncSourceId={interaction.syncSourceId}
      onCursor={interaction.onCursor}
    />
  );
}

export function CandlestickChart({
  categories,
  data,
  volume,
}: CandlestickChartProps): ReactElement | null {
  const { size, ready } = useChartLayout();

  if (!ready || size.width < 1 || size.height < 1) {
    return null;
  }

  return (
    <div
      style={{
        width: size.width,
        height: size.height,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <CartesianChartShell
        categories={categories}
        getRows={(index) => buildOhlcRows(data[index], volume?.[index])}
        plot={
          <CandlestickPlot
            categories={categories}
            data={data}
            volume={volume}
          />
        }
      />
    </div>
  );
}

export type { OhlcPoint } from "@axicharts/charts-echarts";
