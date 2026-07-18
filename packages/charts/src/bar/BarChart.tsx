"use client";

import type { ReactElement, ReactNode } from "react";
import { useMemo } from "react";
import {
  UPlotBar,
  UPlotRangeOverview,
  RANGE_OVERVIEW_HEIGHT,
  preparePlotData,
  type ChartAnnotation,
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
import { sliceCartesianByBrushRange } from "../sync/brushRange";
import { useCartesianBrush } from "../sync/useCartesianBrush";
import type { BrushRange } from "../sync/brushRange";
import { usePlotRenderer } from "../plot/usePlotRenderer";
import { SvgCartesianBar } from "../svg/SvgCartesianBar";
import { useResolvedCartesianProps } from "../composable/resolveCartesianProps";
import { applyTagTonesToSeries } from "../alarm/tagTones";
import { applyChartConfigToSeries } from "../config/applyChartConfig";
import { useCartesianAnnotations } from "../annotations/useCartesianAnnotations";
import { CartesianChartA11yRoot } from "../a11y/CartesianChartA11yRoot";
import { DraggableMarkerOverlay } from "../annotations/DraggableMarkerOverlay";
import { seriesValueBounds } from "../annotations/seriesValueBounds";

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
  annotations?: ChartAnnotation[];
  brush?: boolean;
  brushEnd?: number;
};

type BarPlotProps = {
  categories: string[];
  series: PlotSeries[];
  fullCategoryCount: number;
  showAxes?: boolean;
  showValues?: boolean;
  valueSuffix?: string;
  referenceLines?: ReferenceLine[];
  stacked?: boolean;
  thresholdBands?: ThresholdBand[];
  annotations?: ChartAnnotation[];
  draggableMarkers: ReturnType<typeof useCartesianAnnotations>["draggableMarkers"];
  brush?: boolean;
  brushRange?: BrushRange | null;
  onBrushRangeChange?: (range: BrushRange) => void;
  overviewCategories?: string[];
  overviewSeries?: PlotSeries[];
  engine: "canvas" | "svg";
};

function BarPlot({
  categories,
  series,
  fullCategoryCount,
  showAxes,
  showValues,
  valueSuffix,
  referenceLines,
  stacked = false,
  thresholdBands,
  annotations,
  draggableMarkers,
  brush = false,
  brushRange,
  onBrushRangeChange,
  overviewCategories,
  overviewSeries,
  engine,
}: BarPlotProps): ReactElement {
  const { size, theme, mode, legendVariant } = useChartLayout();
  const plotSync = usePlotSync(fullCategoryCount);
  const chrome = getInteractionChrome(mode);
  const showLegend = chrome.showLegend && series.length > 1;
  const legendHeight = getLegendHeight(showLegend, legendVariant);
  const overviewHeight = brush ? RANGE_OVERVIEW_HEIGHT : 0;
  const plotHeight = Math.floor(size.height) - legendHeight - overviewHeight;
  const valueBounds = useMemo(() => seriesValueBounds(series), [series]);

  return (
    <div style={{ width: Math.floor(size.width), height: Math.floor(size.height) - legendHeight, position: "relative" }}>
      {engine === "svg" ? (
        <SvgCartesianBar
          width={Math.floor(size.width)}
          height={plotHeight}
          categories={categories}
          series={series}
          theme={theme}
          showAxes={showAxes}
          stacked={stacked}
        />
      ) : (
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
          annotations={annotations}
          showCursor={chrome.showCrosshair}
          useNativeLegend={false}
          onCursor={plotSync.onCursor}
          onSyncIndex={plotSync.onSyncIndex}
          syncIndex={plotSync.syncIndex}
          syncSourceId={plotSync.syncSourceId}
          chartId={plotSync.chartId}
        />
      )}
      <DraggableMarkerOverlay
        width={Math.floor(size.width)}
        height={plotHeight}
        categories={categories}
        seriesMin={valueBounds.min}
        seriesMax={valueBounds.max}
        markers={draggableMarkers}
        thresholdBands={thresholdBands}
        referenceLines={referenceLines}
      />
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
  annotations,
  brush = false,
  brushEnd = 100,
}: BarChartProps): ReactElement | null {
  const { size, ready, theme, config, tagTones } = useChartLayout();
  const annotationProps = useCartesianAnnotations({
    annotations,
    thresholdBands,
    referenceLines,
    children,
  });
  const { effectiveRange, onBrushRangeChange } = useCartesianBrush({
    brush,
    brushEnd,
  });
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

  const axes = showAxes ?? theme.axis.show;
  const plotCategories = prepared.categories;
  const plotSeries = prepared.series;

  return (
    <CartesianChartA11yRoot
      chartType="bar"
      categories={categories}
      series={series}
      engine={engine}
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
            fullCategoryCount={categories.length}
            showAxes={axes}
            showValues={showValues}
            valueSuffix={valueSuffix}
            referenceLines={annotationProps.referenceLines}
            stacked={stacked}
            thresholdBands={annotationProps.thresholdBands}
            annotations={annotationProps.annotations}
            draggableMarkers={annotationProps.draggableMarkers}
            brush={brush}
            brushRange={brush ? effectiveRange : null}
            onBrushRangeChange={brush ? onBrushRangeChange : undefined}
            overviewCategories={brush ? categories : undefined}
            overviewSeries={brush ? series : undefined}
            engine={engine}
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
    </CartesianChartA11yRoot>
  );
}
