"use client";

import type { ReactElement } from "react";
import type { PlotSeries } from "@axicharts/charts-canvas";
import { useChartLayout } from "../container/ChartLayoutContext";
import { useChartInteraction } from "../interaction/ChartInteractionContext";
import { resolveSeriesColor, resolveSeriesLabel } from "./resolveSeries";

const LEGEND_HEIGHT = 24;

export function getLegendHeight(show: boolean): number {
  return show ? LEGEND_HEIGHT : 0;
}

export type LegendProps = {
  series: PlotSeries[];
};

export function Legend({ series }: LegendProps): ReactElement | null {
  const { config } = useChartLayout();

  if (series.length < 2) return null;

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
        gap: 14,
        padding: "0 8px",
        fontSize: 11,
        color: "#64748b",
        pointerEvents: "none",
        zIndex: 2,
      }}
    >
      {series.map((item) => {
        const color = resolveSeriesColor(item, config);
        const label = resolveSeriesLabel(item, config);
        return (
          <span
            key={item.name}
            style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
          >
            <span
              aria-hidden
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                background: color,
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
