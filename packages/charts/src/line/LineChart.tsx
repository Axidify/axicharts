"use client";

import type { ReactElement, ReactNode } from "react";
import { useMemo } from "react";
import {
  UPlotLine,
  UPlotRangeOverview,
  RANGE_OVERVIEW_HEIGHT,
  preparePlotData,
  shouldUseDualAxis,
  type ChartAnnotation,
  type ChartGraphicElement,
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
  normalizeChartCategories,
  type ChartCategoryInput,
  type ChartPointerEvent,
  type ChartSeriesInput,
} from "../interaction/chartPointerEvent";

const LINE_SERIES_KINDS = ["line", "area"] as const;

export type LineChartProps = {
  categories?: ChartCategoryInput[];
  series?: ChartSeriesInput[];
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
  annotations?: ChartAnnotation[];
  graphics?: ChartGraphicElement[];
  brush?: boolean;
  brushEnd?: number;
  onMarkerDragEnd?: (event: MarkerDragEndEvent) => void;
  animate?: ChartAnimate;
  liveAnimate?: LiveAnimate;
  selectedCategoryIndex?: number;
  onCategoryClick?: (event: ChartPointerEvent) => void;
  onSeriesClick?: (event: ChartPointerEvent) => void;
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
  annotations?: ChartAnnotation[];
  chartGraphics: ChartGraphicElement[];
  draggableMarkers: ReturnType<typeof useCartesianAnnotations>["draggableMarkers"];
  compact: boolean;
  brush?: boolean;
  brushRange?: BrushRange | null;
  onBrushRangeChange?: (range: BrushRange) => void;
  overviewCategories?: string[];
  overviewSeries?: PlotSeries[];
  engine: "canvas" | "svg";
  onMarkerDragEnd?: (event: MarkerDragEndEvent) => void;
  seriesEnterDelayMs?: (seriesIndex: number) => number;
  categoryMeta?: unknown[];
  selectedCategoryIndex?: number;
  onCategoryClick?: (event: ChartPointerEvent) => void;
  onSeriesClick?: (event: ChartPointerEvent) => void;
  dualAxisResolved?: boolean;
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
  seriesEnterDelayMs,
  categoryMeta = [],
  selectedCategoryIndex,
  onCategoryClick,
  onSeriesClick,
  dualAxisResolved = false,
}: LinePlotProps): ReactElement {
  const { size, theme, mode, legendVariant } = useChartLayout();
  const plotSync = usePlotSync(fullCategoryCount);
  const chrome = getInteractionChrome(mode);
  const showLegend =
    chrome.showLegend && series.length > 1 && !compact;
  const legendHeight = getLegendHeight(showLegend, legendVariant);
  const overviewHeight = brush ? RANGE_OVERVIEW_HEIGHT : 0;
  const plotHeight = Math.floor(size.height) - legendHeight - overviewHeight;
  const valueBounds = useMemo(() => seriesValueBounds(series), [series]);
  const overlayDualAxis = useMemo(
    () => (stacked ? false : shouldUseDualAxis(series, dualAxis)),
    [dualAxis, series, stacked],
  );

  return (
    <div style={{ width: Math.floor(size.width), height: Math.floor(size.height) - legendHeight, position: "relative" }}>
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
          seriesEnterDelayMs={seriesEnterDelayMs}
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
          dualAxis={overlayDualAxis}
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
        dualAxis={overlayDualAxis}
        onDragEnd={onMarkerDragEnd}
      />
      <CategoryClickOverlay
        width={Math.floor(size.width)}
        height={plotHeight}
        categories={categories}
        categoryMeta={categoryMeta}
        series={series}
        compact={compact}
        dualAxis={dualAxisResolved}
        showLegend={showLegend}
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
}: LineChartProps): ReactElement | null {
  const { size, ready, theme, mode, config, tagTones, liveAnimate: contextLiveAnimate } =
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
  const normalizedCategories = useMemo(
    () => normalizeChartCategories(categoriesProp),
    [categoriesProp],
  );
  const { categories, series: resolvedSeries, valueSuffix, curve } = useResolvedCartesianProps(
    {
      categories: normalizedCategories.labels,
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
    kind: fill ? "area" : "line",
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

  const compact = size.height < 72;
  const axes =
    showAxes ?? (theme.axis.show && !compact);
  const plotCategories = prepared.categories;
  const plotSeries = prepared.series;
  const dualAxisResolved = stacked ? false : shouldUseDualAxis(series, dualAxis);

  return (
    <CartesianChartA11yRoot
      chartType={fill ? "area" : "line"}
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
        compact={compact}
        plotMotionStyle={plotMotionStyle}
        plotClassName={motion.plotClassName}
        plotKey={motion.plotKey}
        skipPresentationPlotEnter={motion.skipPresentationPlotEnter}
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
            thresholdBands={annotationProps.thresholdBands}
            referenceLines={annotationProps.referenceLines}
            annotations={annotationProps.annotations}
            chartGraphics={chartGraphics}
            draggableMarkers={annotationProps.draggableMarkers}
            compact={compact}
            brush={brush}
            brushRange={brush ? effectiveRange : null}
            onBrushRangeChange={brush ? onBrushRangeChange : undefined}
            overviewCategories={brush ? categories : undefined}
            overviewSeries={brush ? series : undefined}
            engine={engine}
            onMarkerDragEnd={onMarkerDragEnd}
            seriesEnterDelayMs={motion.seriesEnterDelayMs}
            categoryMeta={normalizedCategories.meta}
            selectedCategoryIndex={selectedCategoryIndex}
            onCategoryClick={onCategoryClick}
            onSeriesClick={onSeriesClick}
            dualAxisResolved={dualAxisResolved}
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
    </CartesianChartA11yRoot>
  );
}
