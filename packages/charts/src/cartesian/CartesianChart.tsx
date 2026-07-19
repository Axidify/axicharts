"use client";

import type { ReactElement, ReactNode } from "react";
import { useMemo } from "react";
import {
  UPlotCombo,
  preparePlotData,
  shouldUseDualAxis,
  type ChartAnnotation,
  type ChartGraphicElement,
  type ComboSeries,
  type DualAxisMode,
  type ReferenceLine,
  type ThresholdBand,
} from "@axicharts/charts-canvas";
import type { LineCurve } from "@axicharts/charts-theme";
import type { RendererPreference } from "@axicharts/charts-core";
import { useChartLayout } from "../container/ChartLayoutContext";
import { CartesianChartShell } from "../chrome/CartesianChartShell";
import { getLegendHeight } from "../chrome/Legend";
import { getInteractionChrome } from "../interaction/mode";
import { usePlotSync } from "../sync/usePlotSync";
import { usePlotSampling } from "../plot/usePlotSampling";
import { applyTagTonesToSeries } from "../alarm/tagTones";
import { applyChartConfigToSeries } from "../config/applyChartConfig";
import { useCartesianAnnotations } from "../annotations/useCartesianAnnotations";
import { CartesianChartA11yRoot } from "../a11y/CartesianChartA11yRoot";
import type { ChartAnimate, LiveAnimate } from "../motion/types";
import {
  seriesDataSignature,
  seriesStructureSignature,
  useCartesianAnimate,
  useLiveCrossfade,
} from "../motion";
import { DraggableMarkerOverlay, type MarkerDragEndEvent } from "../annotations/DraggableMarkerOverlay";
import { seriesValueBounds } from "../annotations/seriesValueBounds";
import { GraphicOverlay } from "../graphic/GraphicOverlay";
import { useChartGraphics } from "../graphic/useChartGraphics";
import { composeComboCartesianMarks } from "../composable/composeComboCartesian";

export type CartesianChartProps = {
  /** Row-oriented data for composable children (`<Bar dataKey="revenue" />`, …). */
  data?: Record<string, unknown>[];
  children?: ReactNode;
  /** Imperative categories (compile / eject imperative style). */
  categories?: string[];
  /** Imperative combo series (compile / eject imperative style). */
  series?: ComboSeries[];
  fill?: boolean;
  showAxes?: boolean;
  showValues?: boolean;
  valueSuffix?: string;
  curve?: LineCurve;
  dualAxis?: DualAxisMode;
  stacked?: boolean;
  referenceLines?: ReferenceLine[];
  thresholdBands?: ThresholdBand[];
  annotations?: ChartAnnotation[];
  graphics?: ChartGraphicElement[];
  renderer?: RendererPreference;
  refreshHz?: number;
  onMarkerDragEnd?: (event: MarkerDragEndEvent) => void;
  animate?: ChartAnimate;
  liveAnimate?: LiveAnimate;
};

type CartesianPlotProps = {
  categories: string[];
  series: ComboSeries[];
  fill?: boolean;
  showAxes?: boolean;
  showValues?: boolean;
  valueSuffix?: string;
  curve?: LineCurve;
  dualAxis?: DualAxisMode;
  stacked?: boolean;
  referenceLines?: ReferenceLine[];
  thresholdBands?: ThresholdBand[];
  annotations?: ChartAnnotation[];
  chartGraphics: ChartGraphicElement[];
  draggableMarkers: ReturnType<typeof useCartesianAnnotations>["draggableMarkers"];
  onMarkerDragEnd?: (event: MarkerDragEndEvent) => void;
};

function CartesianPlot({
  categories,
  series,
  fill,
  showAxes,
  showValues,
  valueSuffix,
  curve,
  dualAxis,
  stacked,
  referenceLines,
  thresholdBands,
  annotations,
  chartGraphics,
  draggableMarkers,
  onMarkerDragEnd,
}: CartesianPlotProps): ReactElement {
  const { size, theme, mode, legendVariant } = useChartLayout();
  const plotSync = usePlotSync();
  const chrome = getInteractionChrome(mode);
  const showLegend = chrome.showLegend && series.length > 1;
  const legendHeight = getLegendHeight(showLegend, legendVariant);
  const plotHeight = Math.floor(size.height) - legendHeight;
  const valueBounds = useMemo(() => seriesValueBounds(series), [series]);
  const overlayDualAxis = useMemo(
    () => shouldUseDualAxis(series, dualAxis),
    [dualAxis, series],
  );

  return (
    <div style={{ position: "relative", width: Math.floor(size.width), height: plotHeight }}>
      <UPlotCombo
        width={Math.floor(size.width)}
        height={plotHeight}
        categories={categories}
        series={series}
        theme={theme}
        fill={fill}
        curve={curve}
        showAxes={showAxes}
        showValues={showValues}
        valueSuffix={valueSuffix}
        dualAxis={dualAxis}
        stacked={stacked}
        referenceLines={referenceLines}
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
    </div>
  );
}

/**
 * Composable cartesian shell — mix bar, line, area data marks with rule/band overlays.
 *
 * @example
 * ```tsx
 * <CartesianChart data={rows}>
 *   <Grid />
 *   <XAxis dataKey="week" />
 *   <YAxis />
 *   <Bar dataKey="revenue" name="Revenue" />
 *   <Line dataKey="target" name="Target" />
 *   <Rule value={50} label="Quota" tone="warning" />
 * </CartesianChart>
 * ```
 */
export function CartesianChart({
  data,
  children,
  categories: categoriesProp,
  series: seriesProp,
  fill = false,
  showAxes,
  showValues = false,
  valueSuffix: valueSuffixProp,
  curve: curveProp,
  dualAxis = "auto",
  stacked = false,
  referenceLines,
  thresholdBands,
  annotations,
  graphics,
  renderer = "auto",
  refreshHz,
  onMarkerDragEnd,
  animate,
  liveAnimate: liveAnimateProp,
}: CartesianChartProps): ReactElement | null {
  const { size, ready, theme, mode, config, tagTones, liveAnimate: contextLiveAnimate } =
    useChartLayout();
  const annotationProps = useCartesianAnnotations({
    annotations,
    thresholdBands,
    referenceLines,
    children,
  });
  const chartGraphics = useChartGraphics({ graphics, children });

  const composed = useMemo(() => {
    if (data && children) {
      return composeComboCartesianMarks(children, data, config);
    }
    return null;
  }, [data, children, config]);

  const categories = composed?.categories ?? categoriesProp ?? [];
  const resolvedSeries = composed?.series ?? seriesProp ?? [];
  const valueSuffix = valueSuffixProp ?? composed?.valueSuffix;
  const curve = curveProp ?? composed?.curve;

  const series = useMemo(() => {
    const configured = applyChartConfigToSeries(resolvedSeries, config);
    return applyTagTonesToSeries(configured, tagTones ?? {}) as ComboSeries[];
  }, [resolvedSeries, config, tagTones]);

  const resolvedFill = useMemo(() => {
    if (series.some((item) => item.fill)) return false;
    return fill;
  }, [fill, series]);

  const maxPoints = usePlotSampling({
    pointCount: categories.length,
    renderer,
    refreshHz,
  });
  const prepared = useMemo(
    () => preparePlotData(categories, series, maxPoints),
    [categories, series, maxPoints],
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
    kind: "combo",
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

  if (
    !ready ||
    size.width < 1 ||
    size.height < 1 ||
    categories.length === 0 ||
    series.length === 0
  ) {
    return null;
  }

  const compact = size.height < 72;
  const axes = showAxes ?? (theme.axis.show && !compact);

  return (
    <CartesianChartA11yRoot
      chartType="combo"
      categories={categories}
      series={series}
      engine="canvas"
      style={{
        width: size.width,
        height: size.height,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <CartesianChartShell
        categories={prepared.categories}
        series={prepared.series}
        valueSuffix={valueSuffix}
        compact={compact}
        plotMotionStyle={plotMotionStyle}
        plotKey={motion.plotKey}
        skipPresentationPlotEnter={motion.skipPresentationPlotEnter}
        plot={
          <CartesianPlot
            categories={prepared.categories}
            series={prepared.series as ComboSeries[]}
            fill={resolvedFill}
            showAxes={axes}
            showValues={showValues}
            valueSuffix={valueSuffix}
            curve={curve}
            dualAxis={dualAxis}
            stacked={stacked}
            referenceLines={annotationProps.referenceLines}
            thresholdBands={annotationProps.thresholdBands}
            annotations={annotationProps.annotations}
            chartGraphics={chartGraphics}
            draggableMarkers={annotationProps.draggableMarkers}
            onMarkerDragEnd={onMarkerDragEnd}
          />
        }
      />
    </CartesianChartA11yRoot>
  );
}
