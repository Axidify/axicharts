import type { ChartTheme } from "@axicharts/charts-theme";
import { SERIES_COLORS, type SeriesTone } from "./types";

export function toneColor(tone: SeriesTone = "default"): string {
  return SERIES_COLORS[tone];
}

export function gridOptions(theme: ChartTheme) {
  return {
    show: theme.grid.show,
    left: 8,
    right: 8,
    top: 16,
    bottom: 24,
    containLabel: true,
    borderColor: "transparent",
    backgroundColor: "transparent",
  };
}

export function axisLabelStyle(theme: ChartTheme) {
  return {
    color: "#64748b",
    fontSize: 11,
    fontFamily: theme.values.monospace
      ? "ui-monospace, SFMono-Regular, Menlo, monospace"
      : "inherit",
  };
}

export function splitLineStyle(theme: ChartTheme) {
  return {
    show: theme.grid.horizontal,
    lineStyle: {
      color: "#e2e8f0",
      opacity: theme.grid.opacity,
      width: theme.grid.strokeWidth,
    },
  };
}

/** Matches React `Tooltip` chrome — use for item-trigger native tooltips (pie). */
export function unifiedTooltipStyle() {
  return {
    backgroundColor: "rgba(255, 255, 255, 0.96)",
    borderColor: "#e2e8f0",
    borderWidth: 1,
    padding: [8, 10],
    textStyle: { color: "#0f172a", fontSize: 11 },
    extraCssText:
      "border-radius: 6px; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);",
  };
}

/** Disable ECharts tooltip when React overlay handles hover. */
export function hiddenTooltip() {
  return { show: false };
}

/** @deprecated Use hiddenTooltip + React Tooltip for axis charts. */
export function tooltipStyle() {
  return {
    trigger: "axis" as const,
    ...unifiedTooltipStyle(),
  };
}

/** Axis pointer config when React crosshair + tooltip own hover. */
export function reactAxisPointer() {
  return {
    type: "line" as const,
    trigger: "axis" as const,
    lineStyle: { opacity: 0 },
    label: { show: false },
    triggerTooltip: false,
  };
}

export function upDownColors() {
  return { up: SERIES_COLORS.success, down: SERIES_COLORS.critical };
}
