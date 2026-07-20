"use client";

import type { CSSProperties, ReactElement } from "react";
import type { PlotSeries } from "@axicharts/charts-canvas";
import { isDarkChartTheme } from "@axicharts/charts-canvas";
import { useChartLayout } from "../container/ChartLayoutContext";
import { resolveSeriesColor, resolveSeriesLabel } from "./resolveSeries";
import {
  DEFAULT_LEGEND_VARIANT,
  legendHeightForVariant,
  legendItemStyle,
  type LegendVariant,
} from "./chromeVariants";

export function getLegendHeight(
  show: boolean,
  variant: LegendVariant = DEFAULT_LEGEND_VARIANT,
): number {
  return show ? legendHeightForVariant(variant) : 0;
}

export type LegendLayout = "overlay" | "flow";

export type LegendProps = {
  series: PlotSeries[];
  /** `overlay` = top of plot (legacy). `flow` = below plot slot (dashboard default). */
  layout?: LegendLayout;
};

export function Legend({
  series,
  layout = "overlay",
}: LegendProps): ReactElement | null {
  const { config, theme, legendVariant = DEFAULT_LEGEND_VARIANT } = useChartLayout();
  const dark = isDarkChartTheme(theme.name);
  const legendHeight = legendHeightForVariant(legendVariant);

  if (series.length < 2) return null;

  const itemStyle = legendItemStyle(legendVariant, dark);

  const flow = layout === "flow";

  return (
    <div
      className="axicharts-legend"
      aria-label="Chart legend"
      style={{
        position: flow ? "relative" : "absolute",
        top: flow ? undefined : 0,
        left: flow ? undefined : 0,
        right: flow ? undefined : 0,
        height: legendHeight,
        display: "flex",
        alignItems: "center",
        justifyContent: flow ? "center" : undefined,
        gap: legendVariant === "compact" ? 6 : 8,
        padding: legendVariant === "inline" ? "0 4px" : "0 6px",
        pointerEvents: "none",
        zIndex: flow ? undefined : 2,
      }}
    >
      {series.map((item, index) => {
        const color = resolveSeriesColor(item, config, index);
        const label = resolveSeriesLabel(item, config);
        return (
          <span key={item.name} style={itemStyle}>
            <span
              aria-hidden
              style={{
                width: legendVariant === "compact" ? 6 : 7,
                height: legendVariant === "compact" ? 6 : 7,
                borderRadius: 999,
                background: color,
                boxShadow: `0 0 0 2px ${dark ? "rgba(15, 23, 42, 0.4)" : "rgba(255, 255, 255, 0.9)"}`,
                flexShrink: 0,
              }}
            />
            <span>{label}</span>
          </span>
        );
      })}
    </div>
  );
}
