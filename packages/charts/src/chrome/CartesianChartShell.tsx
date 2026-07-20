"use client";

import type { CSSProperties, ReactElement, ReactNode } from "react";
import { useEffect, useId } from "react";
import type { PlotSeries } from "@axicharts/charts-canvas";
import { useChartLayout } from "../container/ChartLayoutContext";
import {
  Crosshair,
  getLegendHeight,
  Legend,
  Tooltip,
} from "../chrome";
import { ChartInteractionProvider } from "../interaction/ChartInteractionContext";
import { getInteractionChrome } from "../interaction/mode";
import {
  ensurePresentationStyles,
  presentationEnterStyle,
} from "../presentation/motion";
import { SyncHighlight } from "../sync/SyncHighlight";

import type { TooltipRow } from "./Tooltip";

export type CartesianChromeProps = {
  categories: string[];
  series?: PlotSeries[];
  valueSuffix?: string;
  compact?: boolean;
  getRows?: (index: number) => TooltipRow[] | null;
  plot: ReactNode;
  plotMotionStyle?: CSSProperties;
  plotClassName?: string;
  plotKey?: string;
  skipPresentationPlotEnter?: boolean;
};

function CartesianChromeInner({
  categories,
  series = [],
  valueSuffix,
  compact = false,
  getRows,
  plot,
  plotMotionStyle,
  plotClassName,
  plotKey,
  skipPresentationPlotEnter = false,
}: CartesianChromeProps): ReactElement {
  const { mode, legendVariant, setChromeInset } = useChartLayout();
  const chrome = getInteractionChrome(mode);
  const insetId = useId();
  const showLegend =
    chrome.showLegend && series.length > 1 && !compact;
  const legendHeight = getLegendHeight(showLegend, legendVariant);

  useEffect(() => {
    if (mode === "presentation") {
      ensurePresentationStyles();
    }
  }, [mode]);

  useEffect(() => {
    setChromeInset?.(insetId, showLegend ? legendHeight : 0);
    return () => setChromeInset?.(insetId, 0);
  }, [insetId, legendHeight, setChromeInset, showLegend]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div
        key={plotKey}
        className={plotClassName}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          ...presentationEnterStyle(
            mode === "presentation" && !skipPresentationPlotEnter,
          ),
          ...plotMotionStyle,
        }}
      >
        {plot}
        {chrome.showCrosshair ? <SyncHighlight categories={categories} /> : null}
        {chrome.showCrosshair ? <Crosshair /> : null}
        {chrome.showTooltip ? (
          <Tooltip
            categories={categories}
            series={series}
            valueSuffix={valueSuffix}
            getRows={getRows}
          />
        ) : null}
      </div>
      {showLegend ? (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            height: legendHeight,
            ...presentationEnterStyle(mode === "presentation"),
          }}
        >
          <Legend series={series} layout="flow" />
        </div>
      ) : null}
    </div>
  );
}

export function CartesianChartShell(props: CartesianChromeProps): ReactElement {
  return (
    <ChartInteractionProvider>
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          overflow: "visible",
        }}
      >
        <CartesianChromeInner {...props} />
      </div>
    </ChartInteractionProvider>
  );
}

export { getInteractionChrome };
