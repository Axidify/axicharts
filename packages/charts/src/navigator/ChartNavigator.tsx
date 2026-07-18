"use client";

import { useCallback, useEffect, useMemo, useState, type ReactElement } from "react";
import {
  UPlotRangeOverview,
  RANGE_OVERVIEW_HEIGHT,
  preparePlotData,
  type PlotSeries,
} from "@axicharts/charts-canvas";
import { useChartLayout } from "../container/ChartLayoutContext";
import { useCartesianBrush } from "../sync/useCartesianBrush";
import {
  DEFAULT_NAVIGATOR_PRESETS,
  brushRangeForPreset,
  type NavigatorPreset,
} from "./navigatorPresets";
import { NavigatorPresetButtons, NAVIGATOR_PRESETS_HEIGHT } from "./NavigatorPresetButtons";

export type ChartNavigatorConfig = {
  presets?: NavigatorPreset[];
  initialPreset?: NavigatorPreset;
};

export type ChartNavigatorProps = {
  categories: string[];
  series: PlotSeries[];
  presets?: NavigatorPreset[];
  initialPreset?: NavigatorPreset;
  brushEnd?: number;
};

export const CHART_NAVIGATOR_HEIGHT =
  NAVIGATOR_PRESETS_HEIGHT + RANGE_OVERVIEW_HEIGHT;

export function ChartNavigator({
  categories,
  series,
  presets = DEFAULT_NAVIGATOR_PRESETS,
  initialPreset = "ALL",
  brushEnd,
}: ChartNavigatorProps): ReactElement | null {
  const { size, theme, ready } = useChartLayout();
  const initialRange = useMemo(
    () => brushRangeForPreset(initialPreset, categories),
    [categories, initialPreset],
  );
  const { effectiveRange, onBrushRangeChange } = useCartesianBrush({
    brush: true,
    brushStart: initialRange.start,
    brushEnd: brushEnd ?? initialRange.end,
  });
  const [activePreset, setActivePreset] = useState<NavigatorPreset | null>(
    initialPreset,
  );

  useEffect(() => {
    if (categories.length === 0) return;
    const range = brushRangeForPreset(initialPreset, categories);
    onBrushRangeChange(range);
    setActivePreset(initialPreset);
  }, [categories, initialPreset, onBrushRangeChange]);

  const handlePresetSelect = useCallback(
    (preset: NavigatorPreset) => {
      const range = brushRangeForPreset(preset, categories);
      setActivePreset(preset);
      onBrushRangeChange(range);
    },
    [categories, onBrushRangeChange],
  );

  const handleRangeChange = useCallback(
    (range: { start: number; end: number }) => {
      setActivePreset(null);
      onBrushRangeChange(range);
    },
    [onBrushRangeChange],
  );

  const prepared = useMemo(
    () => preparePlotData(categories, series, categories.length),
    [categories, series],
  );

  if (!ready || size.width < 1 || size.height < 1 || categories.length === 0) {
    return null;
  }

  const width = Math.floor(size.width);

  return (
    <div
      aria-label="Chart navigator"
      style={{
        width,
        height: CHART_NAVIGATOR_HEIGHT,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <NavigatorPresetButtons
        presets={presets}
        active={activePreset}
        onSelect={handlePresetSelect}
        theme={theme}
      />
      <UPlotRangeOverview
        width={width}
        categories={prepared.categories}
        series={prepared.series}
        theme={theme}
        range={effectiveRange ?? { start: 0, end: 100 }}
        onRangeChange={handleRangeChange}
      />
    </div>
  );
}
