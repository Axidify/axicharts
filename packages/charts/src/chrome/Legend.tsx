"use client";

import type { CSSProperties, ReactElement } from "react";
import type { PlotSeries } from "@axicharts/charts-canvas";
import { isDarkChartTheme } from "@axicharts/charts-canvas";
import { useChartLayout } from "../container/ChartLayoutContext";
import { resolveSeriesColor, resolveSeriesLabel } from "./resolveSeries";

const LEGEND_HEIGHT = 28;

export function getLegendHeight(show: boolean): number {
  return show ? LEGEND_HEIGHT : 0;
}

export type LegendProps = {
  series: PlotSeries[];
};

export function Legend({ series }: LegendProps): ReactElement | null {
  const { config, theme } = useChartLayout();
  const dark = isDarkChartTheme(theme.name);

  if (series.length < 2) return null;

  const pillStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "3px 9px",
    borderRadius: 999,
    background: dark ? "rgba(15, 23, 42, 0.55)" : "rgba(241, 245, 249, 0.95)",
    border: dark ? "1px solid rgba(51, 65, 85, 0.8)" : "1px solid #e2e8f0",
    color: dark ? "#cbd5e1" : "#475569",
    fontSize: 11,
    fontWeight: 500,
  };

  return (
    <div
      className="axicharts-legend"
      aria-label="Chart legend"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: LEGEND_HEIGHT,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "0 6px",
        pointerEvents: "none",
        zIndex: 2,
      }}
    >
      {series.map((item, index) => {
        const color = resolveSeriesColor(item, config, index);
        const label = resolveSeriesLabel(item, config);
        return (
          <span key={item.name} style={pillStyle}>
            <span
              aria-hidden
              style={{
                width: 7,
                height: 7,
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
