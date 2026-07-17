"use client";

import type { ReactElement, ReactNode } from "react";
import { useMemo } from "react";
import {
  UPlotBar,
  preparePlotData,
  type PlotSeries,
  type ReferenceLine,
  type ThresholdBand,
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
import { useResolvedCartesianProps } from "../composable/resolveCartesianProps";
import { applyTagTonesToSeries } from "../alarm/tagTones";

const BAR_SERIES_KINDS = ["bar"] as const;

export type BarChartProps = {
  categories?: string[];
  series?: PlotSeries[];
  data?: Record<string, unknown>[];
  children?: ReactNode;
  showAxes?: boolean;
  showValues?: boolean;
  valueSuffix?: string;
  referenceLines?: ReferenceLine[];
  stacked?: boolean;
  renderer?: RendererPreference;
  refreshHz?: number;
  thresholdBands?: ThresholdBand[];
};

type BarPlotProps = {
  categories: string[];
  series: PlotSeries[];
  showAxes?: boolean;
  showValues?: boolean;
  valueSuffix?: string;
  referenceLines?: ReferenceLine[];
  stacked?: boolean;
  thresholdBands?: ThresholdBand[];
};

function BarPlot({
  categories,
  series,
  showAxes,
  showValues,
  valueSuffix,
  referenceLines,
  stacked = false,
  thresholdBands,
}: BarPlotProps): ReactElement {
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
      thresholdBands={thresholdBands}
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
  categories: categoriesProp,
  series: seriesProp,
  data,
  children,
  showAxes,
  showValues = false,
  valueSuffix: valueSuffixProp,
  referenceLines,
  stacked = false,
  renderer = "auto",
  refreshHz,
  thresholdBands,
}: BarChartProps): ReactElement | null {
  const { size, ready, theme, config, tagTones } = useChartLayout();
  const { categories, series: resolvedSeries, valueSuffix } = useResolvedCartesianProps(
    {
      categories: categoriesProp,
      series: seriesProp,
      data,
      children,
      valueSuffix: valueSuffixProp,
    },
    config,
    [...BAR_SERIES_KINDS],
  );
  const series = useMemo(
    () => applyTagTonesToSeries(resolvedSeries, tagTones ?? {}),
    [resolvedSeries, tagTones],
  );
  const maxPoints = usePlotSampling({
    pointCount: categories.length,
    renderer,
    refreshHz,
  });
  const prepared = useMemo(
    () => preparePlotData(categories, series, maxPoints),
    [categories, series, maxPoints],
  );

  if (!ready || size.width < 1 || size.height < 1 || categories.length === 0 || series.length === 0) {
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
            thresholdBands={thresholdBands}
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
