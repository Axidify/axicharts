"use client";

import type { ReactElement, ReactNode } from "react";
import { useMemo } from "react";
import {
  UPlotLine,
  UPlotRangeOverview,
  RANGE_OVERVIEW_HEIGHT,
  preparePlotData,
  type PlotSeries,
  type ReferenceLine,
  type ThresholdBand,
} from "@axicharts/charts-canvas";
import type { RendererPreference } from "@axicharts/charts-core";
import type { LineCurve } from "@axicharts/charts-theme";
import { useChartLayout } from "../container/ChartLayoutContext";
import {
  CartesianChartShell,
} from "../chrome/CartesianChartShell";
import { getLegendHeight } from "../chrome/Legend";
import { getInteractionChrome } from "../interaction/mode";
import { usePlotSync } from "../sync/usePlotSync";
import { sliceCartesianByBrushRange } from "../sync/brushRange";
import { useCartesianBrush } from "../sync/useCartesianBrush";
import type { BrushRange } from "../sync/brushRange";
import { usePlotRenderer } from "../plot/usePlotRenderer";
import { usePlotSampling } from "../plot/usePlotSampling";
import { SvgCartesianLine } from "../svg/SvgCartesianLine";
import { useResolvedCartesianProps } from "../composable/resolveCartesianProps";
import { applyTagTonesToSeries } from "../alarm/tagTones";
import { applyChartConfigToSeries } from "../config/applyChartConfig";

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
  curve?: LineCurve;
  thresholdBands?: ThresholdBand[];
  referenceLines?: ReferenceLine[];
  brush?: boolean;
  brushEnd?: number;
};

type LinePlotProps = {
  categories: string[];
  series: PlotSeries[];
  fullCategoryCount: number;
  fill?: boolean;
  showAxes?: boolean;
  valueSuffix?: string;
  dualAxis?: boolean | "auto";
  stacked?: boolean;
  curve?: LineCurve;
  thresholdBands?: ThresholdBand[];
  referenceLines?: ReferenceLine[];
  compact: boolean;
  brush?: boolean;
  brushRange?: BrushRange | null;
  onBrushRangeChange?: (range: BrushRange) => void;
  overviewCategories?: string[];
  overviewSeries?: PlotSeries[];
  engine: "canvas" | "svg";
};

function LinePlot({
  categories,
  series,
  fullCategoryCount,
  fill,
  showAxes,
  valueSuffix,
  dualAxis,
  compact,
  stacked,
  curve,
  thresholdBands,
  referenceLines,
  brush = false,
  brushRange,
  onBrushRangeChange,
  overviewCategories,
  overviewSeries,
  engine,
}: LinePlotProps): ReactElement {
  const { size, theme, mode, legendVariant } = useChartLayout();
  const plotSync = usePlotSync(fullCategoryCount);
  const chrome = getInteractionChrome(mode);
  const showLegend =
    chrome.showLegend && series.length > 1 && !compact;
  const legendHeight = getLegendHeight(showLegend, legendVariant);
  const overviewHeight = brush ? RANGE_OVERVIEW_HEIGHT : 0;
  const plotHeight = Math.floor(size.height) - legendHeight - overviewHeight;

  return (
    <div style={{ width: Math.floor(size.width), height: Math.floor(size.height) - legendHeight }}>
      {engine === "svg" ? (
        <SvgCartesianLine
          width={Math.floor(size.width)}
          height={plotHeight}
          categories={categories}
          series={series}
          theme={theme}
          fill={fill}
          showAxes={showAxes}
          stacked={stacked}
        />
      ) : (
        <UPlotLine
          width={Math.floor(size.width)}
          height={plotHeight}
          categories={categories}
          series={series}
          theme={theme}
          curve={curve}
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
      )}
      {brush && brushRange && onBrushRangeChange && overviewCategories && overviewSeries ? (
        <UPlotRangeOverview
          width={Math.floor(size.width)}
          categories={overviewCategories}
          series={overviewSeries}
          theme={theme}
          range={brushRange}
          onRangeChange={onBrushRangeChange}
        />
      ) : null}
    </div>
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
  curve: curveProp,
  thresholdBands,
  referenceLines,
  brush = false,
  brushEnd = 100,
}: LineChartProps): ReactElement | null {
  const { size, ready, theme, mode, config, tagTones } = useChartLayout();
  const { effectiveRange, onBrushRangeChange } = useCartesianBrush({
    brush,
    brushEnd,
  });
  const { categories, series: resolvedSeries, valueSuffix, curve } = useResolvedCartesianProps(
    {
      categories: categoriesProp,
      series: seriesProp,
      data,
      children,
      valueSuffix: valueSuffixProp,
      curve: curveProp,
    },
    config,
    [...LINE_SERIES_KINDS],
  );
  const series = useMemo(() => {
    const configured = applyChartConfigToSeries(resolvedSeries, config);
    return applyTagTonesToSeries(configured, tagTones ?? {});
  }, [resolvedSeries, config, tagTones]);
  const brushed = useMemo(
    () => sliceCartesianByBrushRange(categories, series, effectiveRange),
    [categories, series, effectiveRange],
  );
  const { engine, maxPoints } = usePlotRenderer({
    pointCount: brushed.categories.length,
    renderer,
    refreshHz,
    forceCanvas: brush,
  });
  const prepared = useMemo(
    () => preparePlotData(brushed.categories, brushed.series, maxPoints),
    [brushed.categories, brushed.series, maxPoints],
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
            fullCategoryCount={categories.length}
            fill={fill}
            showAxes={axes}
            valueSuffix={valueSuffix}
            dualAxis={dualAxis}
            stacked={stacked}
            curve={curve}
            thresholdBands={thresholdBands}
            referenceLines={referenceLines}
            compact={compact}
            brush={brush}
            brushRange={brush ? effectiveRange : null}
            onBrushRangeChange={brush ? onBrushRangeChange : undefined}
            overviewCategories={brush ? categories : undefined}
            overviewSeries={brush ? series : undefined}
            engine={engine}
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
