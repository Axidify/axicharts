"use client";

import type { ReactElement } from "react";
import {
  UPlotBar,
  type PlotSeries,
  type ReferenceLine,
} from "@axicharts/charts-canvas";
import { useChartLayout } from "../container/ChartLayoutContext";
import {
  CartesianChartShell,
} from "../chrome/CartesianChartShell";
import { getLegendHeight } from "../chrome/Legend";
import { getInteractionChrome } from "../interaction/mode";
import { useChartInteraction } from "../interaction/ChartInteractionContext";

export type BarChartProps = {
  categories: string[];
  series: PlotSeries[];
  showAxes?: boolean;
  showValues?: boolean;
  valueSuffix?: string;
  referenceLines?: ReferenceLine[];
};

function BarPlot({
  categories,
  series,
  showAxes,
  showValues,
  valueSuffix,
  referenceLines,
}: BarChartProps): ReactElement {
  const { size, theme, mode } = useChartLayout();
  const { setCursor } = useChartInteraction();
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
      showCursor={chrome.showCrosshair}
      useNativeLegend={false}
      onCursor={setCursor}
    />
  );
}

export function BarChart({
  categories,
  series,
  showAxes,
  showValues = false,
  valueSuffix,
  referenceLines,
}: BarChartProps): ReactElement | null {
  const { size, ready, theme } = useChartLayout();

  if (!ready || size.width < 1 || size.height < 1) {
    return null;
  }

  const axes = showAxes ?? theme.axis.show;

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
        categories={categories}
        series={series}
        valueSuffix={valueSuffix}
        plot={
          <BarPlot
            categories={categories}
            series={series}
            showAxes={axes}
            showValues={showValues}
            valueSuffix={valueSuffix}
            referenceLines={referenceLines}
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
