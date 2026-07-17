"use client";

import type { ReactElement, ReactNode } from "react";
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

import type { TooltipRow } from "./Tooltip";

export type CartesianChromeProps = {
  categories: string[];
  series?: PlotSeries[];
  valueSuffix?: string;
  compact?: boolean;
  getRows?: (index: number) => TooltipRow[] | null;
  plot: ReactNode;
};

function CartesianChromeInner({
  categories,
  series = [],
  valueSuffix,
  compact = false,
  getRows,
  plot,
}: CartesianChromeProps): ReactElement {
  const { mode } = useChartLayout();
  const chrome = getInteractionChrome(mode);
  const showLegend =
    chrome.showLegend && series.length > 1 && !compact;
  const legendHeight = getLegendHeight(showLegend);

  return (
    <>
      {showLegend ? <Legend series={series} /> : null}
      <div
        style={{
          position: "absolute",
          top: legendHeight,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        {plot}
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
    </>
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
          overflow: "hidden",
        }}
      >
        <CartesianChromeInner {...props} />
      </div>
    </ChartInteractionProvider>
  );
}

export { getInteractionChrome };
