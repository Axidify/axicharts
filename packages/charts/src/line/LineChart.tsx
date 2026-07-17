"use client";

import type { ReactElement, ReactNode } from "react";
import { useMemo } from "react";
import {
  UPlotLine,
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

const LINE_SERIES_KINDS = ["line", "area"] as const;

export type LineChartProps = {
  categories?: string[];
  series?: PlotSeries[];
  data?: Record<string, unknown>[];
  children?: ReactNode;
  fill?: boolean;
  showAxes?: boolean;
  valueSuffix?: string;
  dualAxis?: boolean | "auto";
  stacked?: boolean;
  renderer?: RendererPreference;
  refreshHz?: number;
  thresholdBands?: ThresholdBand[];
  referenceLines?: ReferenceLine[];
};

type LinePlotProps = {
  categories: string[];
  series: PlotSeries[];
  fill?: boolean;
  showAxes?: boolean;
  valueSuffix?: string;
  dualAxis?: boolean | "auto";
  stacked?: boolean;
  thresholdBands?: ThresholdBand[];
  referenceLines?: ReferenceLine[];
  compact: boolean;
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
  thresholdBands,
  referenceLines,
}: LinePlotProps): ReactElement {
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
      thresholdBands={thresholdBands}
      referenceLines={referenceLines}
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
  categories: categoriesProp,
  series: seriesProp,
  data,
  children,
  fill = false,
  showAxes,
  valueSuffix: valueSuffixProp,
  dualAxis = "auto",
  stacked = false,
  renderer = "auto",
  refreshHz,
  thresholdBands,
  referenceLines,
}: LineChartProps): ReactElement | null {
  const { size, ready, theme, mode, config, tagTones } = useChartLayout();
  const { categories, series: resolvedSeries, valueSuffix } = useResolvedCartesianProps(
    {
      categories: categoriesProp,
      series: seriesProp,
      data,
      children,
      valueSuffix: valueSuffixProp,
    },
    config,
    [...LINE_SERIES_KINDS],
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
            thresholdBands={thresholdBands}
            referenceLines={referenceLines}
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
