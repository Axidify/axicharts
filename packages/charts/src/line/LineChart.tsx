"use client";

import type { ReactElement } from "react";
import { UPlotLine, type PlotSeries } from "@axicharts/charts-canvas";
import { useChartLayout } from "../container/ChartLayoutContext";
import {
  CartesianChartShell,
} from "../chrome/CartesianChartShell";
import { getLegendHeight } from "../chrome/Legend";
import { getInteractionChrome } from "../interaction/mode";
import { useChartInteraction } from "../interaction/ChartInteractionContext";

export type LineChartProps = {
  categories: string[];
  series: PlotSeries[];
  fill?: boolean;
  showAxes?: boolean;
  valueSuffix?: string;
  dualAxis?: boolean | "auto";
};

function LinePlot({
  categories,
  series,
  fill,
  showAxes,
  valueSuffix,
  dualAxis,
  compact,
}: LineChartProps & { compact: boolean }): ReactElement {
  const { size, theme, mode } = useChartLayout();
  const { setCursor } = useChartInteraction();
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
      dualAxis={dualAxis}
      showCursor={chrome.showCrosshair}
      useNativeLegend={false}
      onCursor={setCursor}
    />
  );
}

export function LineChart({
  categories,
  series,
  fill = false,
  showAxes,
  valueSuffix,
  dualAxis = "auto",
}: LineChartProps): ReactElement | null {
  const { size, ready, theme, mode } = useChartLayout();

  if (!ready || size.width < 1 || size.height < 1) {
    return null;
  }

  const compact = size.height < 72;
  const axes =
    showAxes ?? (theme.axis.show && !compact);

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
        compact={compact}
        plot={
          <LinePlot
            categories={categories}
            series={series}
            fill={fill}
            showAxes={axes}
            valueSuffix={valueSuffix}
            dualAxis={dualAxis}
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
