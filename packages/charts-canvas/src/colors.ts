import type { SeriesTone } from "./types";

export const SERIES_COLORS: Record<SeriesTone, string> = {
  default: "#3b82f6",
  info: "#3b82f6",
  success: "#22c55e",
  warning: "#f59e0b",
  critical: "#ef4444",
};

export const GRID_COLOR = "#334155";
export const AXIS_COLOR = "#94a3b8";
export const CANVAS_BG = "transparent";

export function withAlpha(hex: string, alpha: number): string {
  const value = hex.replace("#", "");
  const r = Number.parseInt(value.slice(0, 2), 16);
  const g = Number.parseInt(value.slice(2, 4), 16);
  const b = Number.parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
