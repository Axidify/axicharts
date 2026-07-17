"use client";

import type { ReactElement } from "react";
import { useMemo } from "react";
import {
  UPlotBar,
  preparePlotData,
  type PlotSeries,
  type ReferenceLine,
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

export type BarChartProps = {
  categories: string[];
  series: PlotSeries[];
  showAxes?: boolean;
  showValues?: boolean;
  valueSuffix?: string;
  referenceLines?: ReferenceLine[];
  stacked?: boolean;
  renderer?: RendererPreference;
  refreshHz?: number;
};

function BarPlot({
  categories,
  series,
  showAxes,
  showValues,
  valueSuffix,
  referenceLines,
  stacked = false,
}: BarChartProps): ReactElement {
  const { size, theme, mode } = useChartLayout();
  const plotSync = usePlotSync();
  const chrome = getInteractionChrome(mode);
  const showLegend = chrome.showLegend && series.length > 1;
  const legendHeight = getLegendHeight(showLegend);
  const plotHeight = Math.floor(size.height) - legendHeight;

  return (
    <UPlotBar
      width={Math.floor(size.width)}
      height={plotHeight}
      categories={categories}
      series={series}
      theme={theme}
      showAxes={showAxes}
      showValues={showValues}
      valueSuffix={valueSuffix}
      referenceLines={referenceLines}
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

export function BarChart({
  categories,
  series,
  showAxes,
  showValues = false,
  valueSuffix,
  referenceLines,
  stacked = false,
  renderer = "auto",
  refreshHz,
}: BarChartProps): ReactElement | null {
  const { size, ready, theme } = useChartLayout();
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

  const axes = showAxes ?? theme.axis.show;
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
        plot={
          <BarPlot
            categories={plotCategories}
            series={plotSeries}
            showAxes={axes}
            showValues={showValues}
            valueSuffix={valueSuffix}
            referenceLines={referenceLines}
            stacked={stacked}
          />
        }
      />
      {valueSuffix && theme.caption.show ? (
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
    </div>
  );
}
