"use client";

import type { ReactElement, ReactNode } from "react";
import { useMemo } from "react";
import {
  UPlotBar,
  UPlotRangeOverview,
  RANGE_OVERVIEW_HEIGHT,
  preparePlotData,
  type ChartAnnotation,
  type ChartGraphicElement,
  type PlotSeries,
  type ReferenceLine,
  type ThresholdBand,
} from "@axicharts/charts-canvas";
import type { RendererPreference } from "@axicharts/charts-core";
import { useChartLayout } from "../container/ChartLayoutContext";
import {
  CartesianChartShell,
} from "../chrome/CartesianChartShell";
import { getInteractionChrome } from "../interaction/mode";
import { cartesianPlotHeight } from "../cartesian/cartesianPlotLayout";
import { CartesianEmptyPlot } from "../cartesian/CartesianEmptyPlot";
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
import { DraggableMarkerOverlay, type MarkerDragEndEvent } from "../annotations/DraggableMarkerOverlay";
import { seriesValueBounds } from "../annotations/seriesValueBounds";
import { GraphicOverlay } from "../graphic/GraphicOverlay";
import { useChartGraphics } from "../graphic/useChartGraphics";
import { CartesianChartA11yRoot } from "../a11y/CartesianChartA11yRoot";
import type { ChartAnimate, LiveAnimate } from "../motion/types";
import {
  seriesDataSignature,
  seriesStructureSignature,
  useCartesianAnimate,
  useLiveCrossfade,
} from "../motion";
import { CategoryClickOverlay } from "../interaction/CategoryClickOverlay";
import {
  isFlatZeroSeries,
  useCartesianCategoryMeta,
  type CartesianPointerChartProps,
} from "../interaction/cartesianPointerChartProps";
import type { ChartPointerEvent, ChartSeriesInput } from "../interaction/chartPointerEvent";

const BAR_SERIES_KINDS = ["bar"] as const;

export type BarChartProps<TMeta = unknown> = CartesianPointerChartProps<TMeta> & {
  series?: ChartSeriesInput[];
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
  graphics?: ChartGraphicElement[];
  brush?: boolean;
  brushEnd?: number;
  onMarkerDragEnd?: (event: MarkerDragEndEvent) => void;
  animate?: ChartAnimate;
  liveAnimate?: LiveAnimate;
};

type BarPlotProps = {
  categories: string[];
  series: ChartSeriesInput[];
  fullCategoryCount: number;
  showAxes?: boolean;
  showValues?: boolean;
  valueSuffix?: string;
  referenceLines?: ReferenceLine[];
  stacked?: boolean;
  thresholdBands?: ThresholdBand[];
  annotations?: ChartAnnotation[];
  chartGraphics: ChartGraphicElement[];
  draggableMarkers: ReturnType<typeof useCartesianAnnotations>["draggableMarkers"];
  brush?: boolean;
  brushRange?: BrushRange | null;
  onBrushRangeChange?: (range: BrushRange) => void;
  overviewCategories?: string[];
  overviewSeries?: PlotSeries[];
  engine: "canvas" | "svg";
  onMarkerDragEnd?: (event: MarkerDragEndEvent) => void;
  categoryMeta?: unknown[];
  selectedCategoryIndex?: number;
  onCategoryClick?: (event: ChartPointerEvent) => void;
  onSeriesClick?: (event: ChartPointerEvent) => void;
  compact?: boolean;
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
  chartGraphics,
  draggableMarkers,
  brush = false,
  brushRange,
  onBrushRangeChange,
  overviewCategories,
  overviewSeries,
  engine,
  onMarkerDragEnd,
  categoryMeta = [],
  selectedCategoryIndex,
  onCategoryClick,
  onSeriesClick,
  compact = false,
}: BarPlotProps): ReactElement {
  const { size, theme, mode } = useChartLayout();
  const plotSync = usePlotSync(fullCategoryCount);
  const chrome = getInteractionChrome(mode);
  const overviewHeight = brush ? RANGE_OVERVIEW_HEIGHT : 0;
  const plotHeight = cartesianPlotHeight(size, overviewHeight);
  const valueBounds = useMemo(() => seriesValueBounds(series), [series]);

  return (
    <div style={{ width: Math.floor(size.width), height: plotHeight + overviewHeight, position: "relative" }}>
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
      {chartGraphics.length > 0 ? (
        <GraphicOverlay
          width={Math.floor(size.width)}
          height={plotHeight}
          graphics={chartGraphics}
          categories={categories}
          yMin={valueBounds.min}
          yMax={valueBounds.max}
        />
      ) : null}
      <DraggableMarkerOverlay
        width={Math.floor(size.width)}
        height={plotHeight}
        categories={categories}
        seriesMin={valueBounds.min}
        seriesMax={valueBounds.max}
        markers={draggableMarkers}
        thresholdBands={thresholdBands}
        referenceLines={referenceLines}
        onDragEnd={onMarkerDragEnd}
      />
      <CategoryClickOverlay
        width={Math.floor(size.width)}
        height={plotHeight}
        categories={categories}
        categoryMeta={categoryMeta}
        series={series}
        compact={compact}
        selectedCategoryIndex={selectedCategoryIndex}
        onCategoryClick={onCategoryClick}
        onSeriesClick={onSeriesClick}
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
  graphics,
  brush = false,
  brushEnd = 100,
  onMarkerDragEnd,
  animate,
  liveAnimate: liveAnimateProp,
  selectedCategoryIndex,
  onCategoryClick,
  onSeriesClick,
}: BarChartProps): ReactElement | null {
  const { size, ready, theme, mode, config, tagTones, liveAnimate: contextLiveAnimate, dataState, emptyMessage } =
    useChartLayout();
  const annotationProps = useCartesianAnnotations({
    annotations,
    thresholdBands,
    referenceLines,
    children,
  });
  const chartGraphics = useChartGraphics({ graphics, children });
  const { effectiveRange, onBrushRangeChange } = useCartesianBrush({
    brush,
    brushEnd,
  });
  const normalizedCategories = useCartesianCategoryMeta(categoriesProp);
  const { categories, series: resolvedSeries, valueSuffix } = useResolvedCartesianProps(
    {
      categories: normalizedCategories.labels,
      series: seriesProp,
      data,
      children,
      valueSuffix: valueSuffixProp,
    },
    config,
    [...BAR_SERIES_KINDS],
  );
  const series = useMemo(() => {
    const configured = applyChartConfigToSeries(resolvedSeries, config, {
      categories,
    });
    return applyTagTonesToSeries(configured, tagTones ?? {});
  }, [resolvedSeries, config, tagTones, categories]);
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
  const dataSignature = useMemo(
    () => seriesDataSignature(categories, series),
    [categories, series],
  );
  const structureSignature = useMemo(
    () => seriesStructureSignature(categories, series),
    [categories, series],
  );
  const liveAnimate = liveAnimateProp ?? contextLiveAnimate ?? "none";
  const motion = useCartesianAnimate({
    animate,
    kind: "bar",
    dataSignature,
  });
  const liveCrossfade = useLiveCrossfade({
    enabled: liveAnimate === "crossfade",
    structureSignature,
    mode,
  });
  const plotMotionStyle =
    motion.plotStyle || liveCrossfade.plotStyle
      ? { ...motion.plotStyle, ...liveCrossfade.plotStyle }
      : undefined;

  if (!ready || size.width < 1 || size.height < 1 || categories.length === 0 || series.length === 0) {
    return null;
  }

  const dark = theme.name === "live" || theme.name === "industrial";
  if (dataState === "ready" && isFlatZeroSeries(series)) {
    return (
      <CartesianEmptyPlot
        width={size.width}
        height={size.height}
        message={emptyMessage}
        dark={dark}
      />
    );
  }

  const compact = size.height < 72;
  const axes = showAxes ?? (theme.axis.show && !compact);
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
        overflow: "visible",
      }}
    >
      <CartesianChartShell
        categories={plotCategories}
        series={plotSeries}
        valueSuffix={valueSuffix}
        compact={compact}
        plotMotionStyle={plotMotionStyle}
        plotKey={motion.plotKey}
        skipPresentationPlotEnter={motion.skipPresentationPlotEnter}
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
            chartGraphics={chartGraphics}
            draggableMarkers={annotationProps.draggableMarkers}
            brush={brush}
            brushRange={brush ? effectiveRange : null}
            onBrushRangeChange={brush ? onBrushRangeChange : undefined}
            overviewCategories={brush ? categories : undefined}
            overviewSeries={brush ? series : undefined}
            engine={engine}
            onMarkerDragEnd={onMarkerDragEnd}
            categoryMeta={normalizedCategories.meta}
            selectedCategoryIndex={selectedCategoryIndex}
            onCategoryClick={onCategoryClick}
            onSeriesClick={onSeriesClick}
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
            overflow: "visible",
            clip: "rect(0 0 0 0)",
          }}
        >
          Values shown in {valueSuffix.trim()}
        </span>
      ) : null}
    </CartesianChartA11yRoot>
  );
}
