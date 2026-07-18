import type { ChartTheme } from "@axicharts/charts-theme";
import { resolveChartChrome } from "@axicharts/charts-theme";
import type { SeriesTone } from "./types";

/** shadcn-inspired series palette — modern, saturated but not harsh */
export const SERIES_PALETTE = [
  "#2563eb",
  "#0891b2",
  "#16a34a",
  "#d97706",
  "#7c3aed",
  "#db2777",
] as const;

export const SERIES_COLORS: Record<SeriesTone, string> = {
  default: SERIES_PALETTE[0]!,
  info: "#0891b2",
  success: "#16a34a",
  warning: "#d97706",
  critical: "#dc2626",
};

export type ChromeColors = {
  gridRgb: string;
  axis: string;
};

const LIGHT_CHROME: ChromeColors = {
  gridRgb: "226, 232, 240",
  axis: "#64748b",
};

const DARK_CHROME: ChromeColors = {
  gridRgb: "51, 65, 85",
  axis: "#94a3b8",
};

export function isDarkChartTheme(themeName: string): boolean {
  return themeName === "live" || themeName === "industrial";
}

export function resolveChromeColors(
  theme: Pick<ChartTheme, "name" | "tokens">,
): ChromeColors {
  const chrome = resolveChartChrome(theme);
  if (theme.tokens) {
    return {
      gridRgb: chrome.grid,
      axis: chrome.axis,
    };
  }

  return isDarkChartTheme(theme.name) ? DARK_CHROME : LIGHT_CHROME;
}

export function chromeGridStroke(
  theme: Pick<ChartTheme, "name" | "grid" | "tokens">,
  compact = false,
): string {
  if (theme.tokens?.grid) {
    return theme.tokens.grid;
  }

  const { gridRgb } = resolveChromeColors(theme);
  const opacity = compact
    ? Math.min(theme.grid.opacity + 0.12, 0.72)
    : theme.grid.opacity;
  return `rgba(${gridRgb}, ${opacity})`;
}

/** @deprecated Use resolveChromeColors — kept for bench imports */
export const GRID_COLOR = "#94a3b8";
export const AXIS_COLOR = "#64748b";
export const CANVAS_BG = "transparent";

let colorParseCanvas: HTMLCanvasElement | null = null;

function parseRgbChannels(color: string): { r: number; g: number; b: number } | null {
  const trimmed = color.trim();

  if (trimmed.startsWith("#")) {
    const raw = trimmed.slice(1);
    const hex =
      raw.length === 3
        ? raw
            .split("")
            .map((ch) => ch + ch)
            .join("")
        : raw.length >= 6
          ? raw.slice(0, 6)
          : "";
    if (hex.length !== 6) return null;
    const r = Number.parseInt(hex.slice(0, 2), 16);
    const g = Number.parseInt(hex.slice(2, 4), 16);
    const b = Number.parseInt(hex.slice(4, 6), 16);
    if ([r, g, b].some(Number.isNaN)) return null;
    return { r, g, b };
  }

  const rgbMatch = trimmed.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgbMatch) {
    return {
      r: Number(rgbMatch[1]),
      g: Number(rgbMatch[2]),
      b: Number(rgbMatch[3]),
    };
  }

  if (typeof document !== "undefined") {
    colorParseCanvas ??= document.createElement("canvas");
    const ctx = colorParseCanvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#000000";
      ctx.fillStyle = trimmed;
      return parseRgbChannels(ctx.fillStyle);
    }
  }

  return null;
}

export function withAlpha(color: string, alpha: number): string {
  const channels = parseRgbChannels(color);
  if (channels) {
    return `rgba(${channels.r}, ${channels.g}, ${channels.b}, ${alpha})`;
  }

  if (color.startsWith("rgba(")) {
    return color.replace(/,\s*[\d.]+\)$/, `, ${alpha})`);
  }

  return `rgba(37, 99, 235, ${alpha})`;
}

export function createAreaGradient(
  ctx: CanvasRenderingContext2D,
  top: number,
  bottom: number,
  color: string,
  peakOpacity: number,
): CanvasGradient {
  const gradient = ctx.createLinearGradient(0, top, 0, bottom);
  gradient.addColorStop(0, withAlpha(color, peakOpacity));
  gradient.addColorStop(0.65, withAlpha(color, peakOpacity * 0.35));
  gradient.addColorStop(1, withAlpha(color, 0));
  return gradient;
}
