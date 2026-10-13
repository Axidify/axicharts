"use client";

import { useEffect, useMemo, type CSSProperties, type ReactElement, type ReactNode } from "react";
import type { ValueFormat } from "@axicharts/charts-core";
import type { PlotSeries } from "@axicharts/charts-canvas";
import { ChartLayoutContext, useChartLayout } from "../container/ChartLayoutContext";
import type { CartesianChromeSettings } from "../composable/readChromeMarks";
import {
  Crosshair,
  getLegendHeight,
  Legend,
  Tooltip,
} from "../chrome";
import { ChartInteractionProvider } from "../interaction/ChartInteractionContext";
import { getInteractionChrome, shouldShowCartesianLegend } from "../interaction/mode";
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
  valueFormat?: ValueFormat;
  compact?: boolean;
  getRows?: (index: number) => TooltipRow[] | null;
  plot: ReactNode;
  plotMotionStyle?: CSSProperties;
  plotClassName?: string;
  plotKey?: string;
  skipPresentationPlotEnter?: boolean;
  /** From composable `<Tooltip>` / `<Legend>` children. */
  chromeSettings?: CartesianChromeSettings;
};

function CartesianChromeInner({
  categories,
  series = [],
  valueSuffix,
  valueFormat,
  compact = false,
  getRows,
  plot,
  plotMotionStyle,
  plotClassName,
  plotKey,
  skipPresentationPlotEnter = false,
  chromeSettings,
}: CartesianChromeProps): ReactElement {
  const { mode, legendVariant } = useChartLayout();
  const chrome = getInteractionChrome(mode);
  const showTooltip = chrome.showTooltip && !chromeSettings?.tooltip?.hidden;
  const showLegend =
    !chromeSettings?.legend?.hidden &&
    shouldShowCartesianLegend({
      mode,
      seriesCount: series.length,
      compact,
    });
  const legendHeight = getLegendHeight(showLegend, legendVariant);

  useEffect(() => {
    if (mode === "presentation") {
      ensurePresentationStyles();
    }
  }, [mode]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        minHeight: 0,
      }}
    >
      <div
        style={{
          flex: 1,
          minHeight: 0,
          position: "relative",
        }}
      >
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
          {showTooltip ? (
            <Tooltip
              categories={categories}
              series={series}
              valueSuffix={valueSuffix}
              valueFormat={chromeSettings?.tooltip?.formatter ?? valueFormat}
              getRows={getRows}
            />
          ) : null}
        </div>
      </div>
      {showLegend ? (
        <div
          style={{
            flexShrink: 0,
            height: legendHeight,
            display: "flex",
            justifyContent: "center",
            ...presentationEnterStyle(mode === "presentation"),
          }}
        >
          <Legend series={series} layout="flow" />
        </div>
      ) : null}
    </div>
  );
}

/** Scope `<Tooltip variant>` / `<Legend variant>` overrides to this chart's chrome. */
function ChromeVariantScope({
  settings,
  children,
}: {
  settings?: CartesianChromeSettings;
  children: ReactNode;
}): ReactElement {
  const layout = useChartLayout();
  const tooltipVariant = settings?.tooltip?.variant;
  const legendVariant = settings?.legend?.variant;
  const scoped = useMemo(
    () =>
      tooltipVariant || legendVariant
        ? {
            ...layout,
            tooltipVariant: tooltipVariant ?? layout.tooltipVariant,
            legendVariant: legendVariant ?? layout.legendVariant,
          }
        : layout,
    [layout, tooltipVariant, legendVariant],
  );
  return <ChartLayoutContext.Provider value={scoped}>{children}</ChartLayoutContext.Provider>;
}

export function CartesianChartShell(props: CartesianChromeProps): ReactElement {
  return (
    <ChromeVariantScope settings={props.chromeSettings}>
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
    </ChromeVariantScope>
  );
}

export { getInteractionChrome };
