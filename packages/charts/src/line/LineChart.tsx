"use client";

import type { ReactElement } from "react";
import { useMemo } from "react";
import {
  UPlotLine,
  preparePlotData,
  type PlotSeries,
} from "@axicharts/charts-canvas";
import type { RendererPreference } from "@axicharts/charts-core";
import { useChartLayout } from "../container/ChartLayoutContext";
import {
  CartesianChartShell,
} from "../chrome/CartesianChartShell";
import { getLegendHeight } from "../chrome/Legend";
import { getInteractionChrome } from "../interaction/mode";
import { usePlotSync } from "../sync/usePlotSync";
import { usePlotSampling } from "../plot/usePlotSampling";

export type LineChartProps = {
  categories: string[];
  series: PlotSeries[];
  fill?: boolean;
  showAxes?: boolean;
  valueSuffix?: string;
  dualAxis?: boolean | "auto";
  stacked?: boolean;
  renderer?: RendererPreference;
  refreshHz?: number;
};

function LinePlot({
  categories,
  series,
  fill,
  showAxes,
  valueSuffix,
  dualAxis,
  compact,
  stacked,
}: LineChartProps & { compact: boolean }): ReactElement {
  const { size, theme, mode } = useChartLayout();
  const plotSync = usePlotSync();
  const chrome = getInteractionChrome(mode);
  const showLegend =
    chrome.showLegend && series.length > 1 && !compact;
  const legendHeight = getLegendHeight(showLegend);
  const plotHeight = Math.floor(size.height) - legendHeight;

  return (
    <UPlotLine
      width={Math.floor(size.width)}
      height={plotHeight}
      categories={categories}
      series={series}
      theme={theme}
      fill={fill}
      showAxes={showAxes}
      valueSuffix={valueSuffix}
      dualAxis={stacked ? false : dualAxis}
      stacked={stacked}
      showCursor={chrome.showCrosshair}
      useNativeLegend={false}
      onCursor={plotSync.onCursor}
      onSyncIndex={plotSync.onSyncIndex}
      syncIndex={plotSync.syncIndex}
      syncSourceId={plotSync.syncSourceId}
      chartId={plotSync.chartId}
    />
  );
}

export function LineChart({
  categories,
  series,
  fill = false,
  showAxes,
  valueSuffix,
  dualAxis = "auto",
  stacked = false,
  renderer = "auto",
  refreshHz,
}: LineChartProps): ReactElement | null {
  const { size, ready, theme, mode } = useChartLayout();
  const maxPoints = usePlotSampling({
    pointCount: categories.length,
    renderer,
    refreshHz,
  });
  const prepared = useMemo(
    () => preparePlotData(categories, series, maxPoints),
    [categories, series, maxPoints],
  );

  if (!ready || size.width < 1 || size.height < 1) {
    return null;
  }

  const compact = size.height < 72;
  const axes =
    showAxes ?? (theme.axis.show && !compact);
  const plotCategories = prepared.categories;
  const plotSeries = prepared.series;

  return (
    <div
      aria-label={series.map((item) => item.name).join(", ")}
      style={{
        width: size.width,
        height: size.height,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <CartesianChartShell
        categories={plotCategories}
        series={plotSeries}
        valueSuffix={valueSuffix}
        compact={compact}
        plot={
          <LinePlot
            categories={plotCategories}
            series={plotSeries}
            fill={fill}
            showAxes={axes}
            valueSuffix={valueSuffix}
            dualAxis={dualAxis}
            stacked={stacked}
            compact={compact}
          />
        }
      />
      {valueSuffix && theme.caption.show && !compact ? (
        <span
          style={{
            position: "absolute",
            width: 1,
            height: 1,
            overflow: "hidden",
            clip: "rect(0 0 0 0)",
          }}
        >
          Values shown in {valueSuffix.trim()}
        </span>
      ) : null}
      {mode === "live" ? (
        <span
          style={{
            position: "absolute",
            width: 1,
            height: 1,
            overflow: "hidden",
            clip: "rect(0 0 0 0)",
          }}
        >
          Live chart
        </span>
      ) : null}
    </div>
  );
}
