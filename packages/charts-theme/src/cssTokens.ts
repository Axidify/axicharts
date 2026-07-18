import type { ChartTheme } from "./themes";

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
    grid: grid || "rgba(226, 232, 240, 0.95)",
    axis: axis || "#64748b",
    areaFill: readVar(style, "--chart-area-fill") || undefined,
    alarmWarning: readVar(style, "--chart-alarm-warning") || undefined,
    alarmCritical: readVar(style, "--chart-alarm-critical") || undefined,
  };
}

export function resolveThemeTokens(
  theme: ChartTheme,
  element?: Element | null,
): ChartTheme {
  const tokens = readCssChartTokens(element);
  if (!tokens) {
    return theme;
  }

  return {
    ...theme,
    tokens,
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
  if (theme.tokens) {
    return {
      grid: theme.tokens.grid,
      axis: theme.tokens.axis,
    };
  }

  const dark = theme.name === "live" || theme.name === "industrial";
  return {
    grid: dark ? "rgba(51, 65, 85, 0.62)" : "rgba(226, 232, 240, 0.95)",
    axis: dark ? "#94a3b8" : "#64748b",
  };
}
