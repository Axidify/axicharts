"use client";

import type { ReactElement } from "react";
import type { PlotSeries } from "@axicharts/charts-canvas";
import { useChartLayout } from "../container/ChartLayoutContext";
import { useChartInteraction } from "../interaction/ChartInteractionContext";
import {
  formatSeriesValue,
  resolveSeriesColor,
  resolveSeriesLabel,
} from "./resolveSeries";

export type TooltipProps = {
  categories: string[];
  series: PlotSeries[];
  valueSuffix?: string;
};

export function Tooltip({
  categories,
  series,
  valueSuffix = "",
}: TooltipProps): ReactElement | null {
  const { cursor } = useChartInteraction();
  const { config } = useChartLayout();

  if (!cursor || cursor.index < 0) return null;

  const category = categories[cursor.index] ?? "";
  const suffix = valueSuffix ?? "";

  const left = Math.min(
    Math.max(cursor.left + 12, 8),
    Math.max(8, cursor.left),
  );

  return (
    <div
      className="axicharts-tooltip"
      role="tooltip"
      style={{
        position: "absolute",
        top: 8,
        left,
        minWidth: 120,
        maxWidth: 220,
        padding: "8px 10px",
        borderRadius: 6,
        border: "1px solid #e2e8f0",
        background: "rgba(255, 255, 255, 0.96)",
        boxShadow: "0 4px 12px rgba(15, 23, 42, 0.08)",
        fontSize: 11,
        color: "#0f172a",
        pointerEvents: "none",
        zIndex: 3,
      }}
    >
      <div
        style={{
          fontWeight: 600,
          marginBottom: 6,
          color: "#334155",
        }}
      >
        {category}
      </div>
      <div style={{ display: "grid", gap: 4 }}>
        {series.map((item) => {
          const value = item.data[cursor.index];
          if (value == null) return null;
          const color = resolveSeriesColor(item, config);
          const label = resolveSeriesLabel(item, config);
          return (
            <div
              key={item.name}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <span
                style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
              >
                <span
                  aria-hidden
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: 999,
                    background: color,
                  }}
                />
                <span style={{ color: "#64748b" }}>{label}</span>
              </span>
              <span style={{ fontVariantNumeric: "tabular-nums" }}>
                {formatSeriesValue(value, suffix)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
