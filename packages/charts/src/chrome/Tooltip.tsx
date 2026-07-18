"use client";

import type { ReactElement } from "react";
import type { PlotSeries } from "@axicharts/charts-canvas";
import { isDarkChartTheme } from "@axicharts/charts-canvas";
import { useChartLayout } from "../container/ChartLayoutContext";
import { useChartInteraction } from "../interaction/ChartInteractionContext";
import {
  formatSeriesValue,
  resolveSeriesColor,
  resolveSeriesLabel,
} from "./resolveSeries";
import {
  DEFAULT_TOOLTIP_VARIANT,
  tooltipRowsGap,
  tooltipSurfaceStyle,
  tooltipTitleStyle,
  type TooltipVariant,
} from "./chromeVariants";

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

function TooltipRows({
  rows,
  dark,
  variant,
}: {
  rows: TooltipRow[];
  dark: boolean;
  variant: TooltipVariant;
}): ReactElement {
  return (
    <div style={{ display: "grid", gap: tooltipRowsGap(variant) }}>
      {rows.map((row) => (
        <div
          key={`${row.label}-${row.value}`}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: variant === "dense" ? 8 : 12,
          }}
        >
          <span
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            {row.color ? (
              <span
                aria-hidden
                style={{
                  width: variant === "dense" ? 6 : 7,
                  height: variant === "dense" ? 6 : 7,
                  borderRadius: 999,
                  background: row.color,
                  boxShadow: `0 0 0 2px ${dark ? "rgba(15, 23, 42, 0.5)" : "rgba(255, 255, 255, 0.95)"}`,
                }}
              />
            ) : null}
            <span style={{ color: dark ? "#94a3b8" : "#64748b" }}>{row.label}</span>
          </span>
          <span
            style={{
              fontVariantNumeric: "tabular-nums",
              fontWeight: 600,
              color: dark ? "#f1f5f9" : "#0f172a",
            }}
          >
            {row.value}
          </span>
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
  const { config, theme, tooltipVariant = DEFAULT_TOOLTIP_VARIANT } = useChartLayout();
  const dark = isDarkChartTheme(theme.name);
  const surface = tooltipSurfaceStyle(tooltipVariant, dark);
  const titleStyle = tooltipTitleStyle(dark);

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
          ...surface,
        }}
      >
        <div style={titleStyle}>{itemHover.title}</div>
        <TooltipRows rows={itemHover.rows} dark={dark} variant={tooltipVariant} />
      </div>
    );
  }

  if (!cursor || cursor.index < 0) return null;

  const category = categories[cursor.index] ?? "";
  const suffix = valueSuffix ?? "";
  const derivedRows: TooltipRow[] = [];
  if (!getRows) {
    for (const [index, item] of series.entries()) {
      const value = item.data[cursor.index];
      if (value == null) continue;
      derivedRows.push({
        label: resolveSeriesLabel(item, config),
        value: formatSeriesValue(value, suffix),
        color: resolveSeriesColor(item, config, index),
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
        ...surface,
      }}
    >
      {category ? <div style={titleStyle}>{category}</div> : null}
      <TooltipRows rows={rows} dark={dark} variant={tooltipVariant} />
    </div>
  );
}
