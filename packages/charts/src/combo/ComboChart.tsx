"use client";

import type { ReactElement } from "react";
import { useMemo } from "react";
import {
  UPlotCombo,
  preparePlotData,
  type ComboSeries,
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

export type ComboChartProps = {
  categories: string[];
  series: ComboSeries[];
  fill?: boolean;
  showAxes?: boolean;
  showValues?: boolean;
  valueSuffix?: string;
  curve?: LineCurve;
  referenceLines?: ReferenceLine[];
  thresholdBands?: ThresholdBand[];
  renderer?: RendererPreference;
  refreshHz?: number;
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
  referenceLines,
  thresholdBands,
}: ComboPlotProps): ReactElement {
  const { size, theme, mode, legendVariant } = useChartLayout();
  const plotSync = usePlotSync();
  const chrome = getInteractionChrome(mode);
  const showLegend = chrome.showLegend && series.length > 1;
  const legendHeight = getLegendHeight(showLegend, legendVariant);
  const plotHeight = Math.floor(size.height) - legendHeight;

  return (
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
      referenceLines={referenceLines}
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

export function ComboChart({
  categories,
  series: seriesProp,
  fill = false,
  showAxes,
  showValues = false,
  valueSuffix,
  curve,
  referenceLines,
  thresholdBands,
  renderer = "auto",
  refreshHz,
}: ComboChartProps): ReactElement | null {
  const { size, ready, theme, config, tagTones } = useChartLayout();
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
            referenceLines={referenceLines}
            thresholdBands={thresholdBands}
          />
        }
      />
    </div>
  );
}
