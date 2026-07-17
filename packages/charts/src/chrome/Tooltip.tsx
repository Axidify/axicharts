"use client";

import type { CSSProperties, ReactElement } from "react";
import type { PlotSeries } from "@axicharts/charts-canvas";
import { useChartLayout } from "../container/ChartLayoutContext";
import { useChartInteraction } from "../interaction/ChartInteractionContext";
import {
  formatSeriesValue,
  resolveSeriesColor,
  resolveSeriesLabel,
} from "./resolveSeries";

export type TooltipRow = {
  label: string;
  value: string;
  color?: string;
};

export type TooltipProps = {
  categories?: string[];
  series?: PlotSeries[];
  valueSuffix?: string;
  getRows?: (index: number) => TooltipRow[] | null;
};

const tooltipSurfaceStyle: CSSProperties = {
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
};

function TooltipRows({ rows }: { rows: TooltipRow[] }): ReactElement {
  return (
    <div style={{ display: "grid", gap: 4 }}>
      {rows.map((row) => (
        <div
          key={`${row.label}-${row.value}`}
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
            {row.color ? (
              <span
                aria-hidden
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 999,
                  background: row.color,
                }}
              />
            ) : null}
            <span style={{ color: "#64748b" }}>{row.label}</span>
          </span>
          <span style={{ fontVariantNumeric: "tabular-nums" }}>{row.value}</span>
        </div>
      ))}
    </div>
  );
}

export function Tooltip({
  categories = [],
  series = [],
  valueSuffix = "",
  getRows,
}: TooltipProps): ReactElement | null {
  const { cursor, itemHover } = useChartInteraction();
  const { config } = useChartLayout();

  if (itemHover) {
    const left = Math.min(
      Math.max(itemHover.left + 12, 8),
      Math.max(8, itemHover.left),
    );
    const top = Math.max(8, itemHover.top - 8);

    return (
      <div
        className="axicharts-tooltip"
        role="tooltip"
        style={{
          position: "absolute",
          top,
          left,
          ...tooltipSurfaceStyle,
        }}
      >
        <div
          style={{
            fontWeight: 600,
            marginBottom: 6,
            color: "#334155",
          }}
        >
          {itemHover.title}
        </div>
        <TooltipRows rows={itemHover.rows} />
      </div>
    );
  }

  if (!cursor || cursor.index < 0) return null;

  const category = categories[cursor.index] ?? "";
  const suffix = valueSuffix ?? "";
  const derivedRows: TooltipRow[] = [];
  if (!getRows) {
    for (const item of series) {
      const value = item.data[cursor.index];
      if (value == null) continue;
      derivedRows.push({
        label: resolveSeriesLabel(item, config),
        value: formatSeriesValue(value, suffix),
        color: resolveSeriesColor(item, config),
      });
    }
  }
  const rows = getRows?.(cursor.index) ?? derivedRows;

  if (rows.length === 0) return null;

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
        ...tooltipSurfaceStyle,
      }}
    >
      {category ? (
        <div
          style={{
            fontWeight: 600,
            marginBottom: 6,
            color: "#334155",
          }}
        >
          {category}
        </div>
      ) : null}
      <TooltipRows rows={rows} />
    </div>
  );
}
