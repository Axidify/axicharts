"use client";

import type { ReactElement } from "react";
import { useMemo } from "react";
import {
  UPlotCombo,
  preparePlotData,
  shouldUseDualAxis,
  type ChartAnnotation,
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
import { DraggableMarkerOverlay, type MarkerDragEndEvent } from "../annotations/DraggableMarkerOverlay";
import { seriesValueBounds } from "../annotations/seriesValueBounds";

export type ComboChartProps = {
  categories: string[];
  series: ComboSeries[];
  fill?: boolean;
  showAxes?: boolean;
  showValues?: boolean;
  valueSuffix?: string;
  curve?: LineCurve;
  dualAxis?: DualAxisMode;
  referenceLines?: ReferenceLine[];
  thresholdBands?: ThresholdBand[];
  annotations?: ChartAnnotation[];
  renderer?: RendererPreference;
  refreshHz?: number;
  onMarkerDragEnd?: (event: MarkerDragEndEvent) => void;
};

type ComboPlotProps = ComboChartProps;

function ComboPlot({
  categories,
  series,
  fill,
  showAxes,
  showValues,
  valueSuffix,
  curve,
  dualAxis,
  referenceLines,
  thresholdBands,
  annotations,
  draggableMarkers,
  onMarkerDragEnd,
}: ComboPlotProps & {
  draggableMarkers: ReturnType<typeof useCartesianAnnotations>["draggableMarkers"];
  onMarkerDragEnd?: (event: MarkerDragEndEvent) => void;
}): ReactElement {
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

export function ComboChart({
  categories,
  series: seriesProp,
  fill = false,
  showAxes,
  showValues = false,
  valueSuffix,
  curve,
  dualAxis = "auto",
  referenceLines,
  thresholdBands,
  annotations,
  renderer = "auto",
  refreshHz,
  onMarkerDragEnd,
}: ComboChartProps): ReactElement | null {
  const { size, ready, theme, config, tagTones } = useChartLayout();
  const annotationProps = useCartesianAnnotations({
    annotations,
    thresholdBands,
    referenceLines,
  });
  const series = useMemo(() => {
    const configured = applyChartConfigToSeries(seriesProp, config);
    return applyTagTonesToSeries(configured, tagTones ?? {}) as ComboSeries[];
  }, [seriesProp, config, tagTones]);
  const maxPoints = usePlotSampling({
    pointCount: categories.length,
    renderer,
    refreshHz,
  });
  const prepared = useMemo(
    () => preparePlotData(categories, series, maxPoints),
    [categories, series, maxPoints],
  );

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
        plot={
          <ComboPlot
            categories={prepared.categories}
            series={prepared.series as ComboSeries[]}
            fill={fill}
            showAxes={axes}
            showValues={showValues}
            valueSuffix={valueSuffix}
            curve={curve}
            dualAxis={dualAxis}
            referenceLines={annotationProps.referenceLines}
            thresholdBands={annotationProps.thresholdBands}
            annotations={annotationProps.annotations}
            draggableMarkers={annotationProps.draggableMarkers}
            onMarkerDragEnd={onMarkerDragEnd}
          />
        }
      />
    </CartesianChartA11yRoot>
  );
}
