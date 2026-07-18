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
  const dark = theme.name === "live" || theme.name === "industrial";
  return {
    color: dark ? "#94a3b8" : "#64748b",
    fontSize: 11,
    fontFamily: theme.values.monospace
      ? "ui-monospace, SFMono-Regular, Menlo, monospace"
      : "inherit",
  };
}

export function splitLineStyle(theme: ChartTheme) {
  const dark = theme.name === "live" || theme.name === "industrial";
  return {
    show: theme.grid.horizontal,
    lineStyle: {
      color: dark ? "rgba(51, 65, 85, 0.62)" : "rgba(226, 232, 240, 0.95)",
      width: theme.grid.strokeWidth,
    },
  };
}

/** Matches React `Tooltip` chrome — use for item-trigger native tooltips (pie). */
export function unifiedTooltipStyle() {
  return {
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    borderColor: "rgba(226, 232, 240, 0.95)",
    borderWidth: 1,
    padding: [10, 12],
    textStyle: { color: "#0f172a", fontSize: 11, fontWeight: 600 },
    extraCssText:
      "border-radius: 10px; box-shadow: 0 10px 28px rgba(15, 23, 42, 0.1); backdrop-filter: blur(10px);",
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
