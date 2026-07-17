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

export function tooltipStyle() {
  return {
    trigger: "axis" as const,
    backgroundColor: "#ffffff",
    borderColor: "#e2e8f0",
    textStyle: { color: "#0f172a", fontSize: 12 },
  };
}

export function upDownColors() {
  return { up: SERIES_COLORS.success, down: SERIES_COLORS.critical };
}
