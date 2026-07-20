import type { ChartTheme } from "./themes";
import {
  isAcceptableChromeColor,
  resolveCanvasRgb,
  resolveComputedRgb,
} from "./contrast";

export type ChartColorTokens = {
  palette: string[];
  grid: string;
  axis: string;
  areaFill?: string;
  alarmWarning?: string;
  alarmCritical?: string;
};

export type SeriesTone =
  | "default"
  | "info"
  | "success"
  | "warning"
  | "critical";

const FALLBACK_PALETTE = [
  "#2563eb",
  "#0891b2",
  "#16a34a",
  "#d97706",
  "#7c3aed",
  "#db2777",
] as const;

const FALLBACK_TONE_COLORS: Record<SeriesTone, string> = {
  default: FALLBACK_PALETTE[0]!,
  info: "#0891b2",
  success: "#16a34a",
  warning: "#d97706",
  critical: "#dc2626",
};

const FALLBACK_CHROME_LIGHT = {
  grid: "rgba(226, 232, 240, 0.95)",
  axis: "#64748b",
};

const FALLBACK_CHROME_DARK = {
  grid: "rgba(51, 65, 85, 0.62)",
  axis: "#94a3b8",
};

function formatCssColor(raw: string): string {
  const value = raw.trim();
  if (!value) return "";
  if (
    value.startsWith("#") ||
    value.startsWith("rgb") ||
    value.startsWith("hsl")
  ) {
    return value;
  }
  return `hsl(${value})`;
}

function readVar(style: CSSStyleDeclaration, name: string): string {
  return formatCssColor(style.getPropertyValue(name));
}

function isDarkThemeName(themeName: string): boolean {
  return themeName === "live" || themeName === "industrial";
}

function plotBackgroundRgb(themeName: string): { r: number; g: number; b: number } {
  return isDarkThemeName(themeName)
    ? { r: 15, g: 23, b: 42 }
    : { r: 255, g: 255, b: 255 };
}

function canonicalChromeColor(
  color: string,
  element?: Element | null,
): string | null {
  const rgb =
    resolveCanvasRgb(color) ??
    resolveComputedRgb(color, element ?? undefined);
  if (!rgb) return null;
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

function sanitizeChromeColor(
  color: string,
  role: "grid" | "axis",
  background: { r: number; g: number; b: number },
  fallback: string,
  element?: Element | null,
): string {
  if (isAcceptableChromeColor(color, role, background, element)) {
    return canonicalChromeColor(color, element) ?? color;
  }
  return fallback;
}

/** Public guard for canvas adapters when tokens are set manually. */
export function sanitizeChromeToken(
  color: string,
  role: "grid" | "axis",
  themeName: string,
  element?: Element | null,
): string | null {
  const fallback =
    role === "grid"
      ? (isDarkThemeName(themeName)
          ? FALLBACK_CHROME_DARK.grid
          : FALLBACK_CHROME_LIGHT.grid)
      : isDarkThemeName(themeName)
        ? FALLBACK_CHROME_DARK.axis
        : FALLBACK_CHROME_LIGHT.axis;

  const background = plotBackgroundRgb(themeName);
  if (!isAcceptableChromeColor(color, role, background, element)) {
    return null;
  }
  return canonicalChromeColor(color, element) ?? color;
}

function sanitizeChartTokens(
  tokens: ChartColorTokens,
  themeName: string,
  element?: Element | null,
): ChartColorTokens {
  const fallback = isDarkThemeName(themeName)
    ? FALLBACK_CHROME_DARK
    : FALLBACK_CHROME_LIGHT;
  const background = plotBackgroundRgb(themeName);

  return {
    ...tokens,
    axis: sanitizeChromeColor(
      tokens.axis,
      "axis",
      background,
      fallback.axis,
      element,
    ),
    grid: sanitizeChromeColor(
      tokens.grid,
      "grid",
      background,
      fallback.grid,
      element,
    ),
  };
}

export function readCssChartTokens(
  element?: Element | null,
): ChartColorTokens | null {
  if (
    typeof window === "undefined" ||
    typeof getComputedStyle === "undefined"
  ) {
    return null;
  }

  const target = element ?? document.documentElement;
  const style = getComputedStyle(target);

  const palette = [1, 2, 3, 4, 5]
    .map((index) => readVar(style, `--chart-${index}`))
    .filter((color) => color.length > 0);

  if (palette.length === 0) {
    return null;
  }

  const grid = readVar(style, "--chart-grid");
  const axis = readVar(style, "--chart-axis");

  return {
    palette,
    grid: grid || FALLBACK_CHROME_LIGHT.grid,
    axis: axis || FALLBACK_CHROME_LIGHT.axis,
    areaFill: readVar(style, "--chart-area-fill") || undefined,
    alarmWarning: readVar(style, "--chart-alarm-warning") || undefined,
    alarmCritical: readVar(style, "--chart-alarm-critical") || undefined,
  };
}

export function resolveThemeTokens(
  theme: ChartTheme,
  element?: Element | null,
): ChartTheme {
  const cssTokens = readCssChartTokens(element);
  if (!cssTokens) {
    return theme;
  }

  const explicit = theme.tokens;
  const merged: ChartColorTokens = {
    ...cssTokens,
    ...(explicit?.grid ? { grid: explicit.grid } : {}),
    ...(explicit?.axis ? { axis: explicit.axis } : {}),
    ...(explicit?.areaFill ? { areaFill: explicit.areaFill } : {}),
    ...(explicit?.alarmWarning ? { alarmWarning: explicit.alarmWarning } : {}),
    ...(explicit?.alarmCritical ? { alarmCritical: explicit.alarmCritical } : {}),
    ...(explicit?.palette?.length ? { palette: explicit.palette } : {}),
  };

  return {
    ...theme,
    tokens: sanitizeChartTokens(merged, theme.name, element),
  };
}

export function resolveChartPalette(
  theme?: Pick<ChartTheme, "tokens">,
): readonly string[] {
  return theme?.tokens?.palette ?? FALLBACK_PALETTE;
}

export function resolveToneColors(
  theme?: Pick<ChartTheme, "tokens">,
): Record<SeriesTone, string> {
  const palette = resolveChartPalette(theme);
  const tokens = theme?.tokens;

  return {
    default: palette[0] ?? FALLBACK_TONE_COLORS.default,
    info: palette[1] ?? FALLBACK_TONE_COLORS.info,
    success: palette[2] ?? FALLBACK_TONE_COLORS.success,
    warning: tokens?.alarmWarning ?? palette[3] ?? FALLBACK_TONE_COLORS.warning,
    critical:
      tokens?.alarmCritical ?? FALLBACK_TONE_COLORS.critical,
  };
}

export function resolveChartChrome(
  theme: Pick<ChartTheme, "name" | "tokens">,
): { grid: string; axis: string } {
  const dark = isDarkThemeName(theme.name);
  const fallback = dark ? FALLBACK_CHROME_DARK : FALLBACK_CHROME_LIGHT;

  if (theme.tokens) {
    return {
      grid:
        sanitizeChromeToken(theme.tokens.grid, "grid", theme.name) ??
        fallback.grid,
      axis:
        sanitizeChromeToken(theme.tokens.axis, "axis", theme.name) ??
        fallback.axis,
    };
  }

  return fallback;
}
