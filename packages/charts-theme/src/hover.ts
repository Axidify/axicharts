import type { ChartTheme } from "./themes";

export type ChartThemeHover = {
  /** Inactive mark opacity for region/item hover (map, geo, ECharts blur). */
  dimOpacity: number;
  /** Inactive task opacity on Gantt timelines — stronger dim for horizontal bars. */
  taskDimOpacity: number;
  /** Pie slice scale in presentation mode only. */
  scaleSize: number;
  shadowBlur: number;
  shadowColor: string;
};

export const defaultChartThemeHover: ChartThemeHover = {
  dimOpacity: 0.72,
  taskDimOpacity: 0.45,
  scaleSize: 6,
  shadowBlur: 10,
  shadowColor: "rgba(15, 23, 42, 0.12)",
};

export type HoverChrome = ChartThemeHover & {
  stroke: string;
  bandColor: string;
  bandFollowerColor: string;
  bandFollowerBorder: string;
  dimOverlay: string;
};

export type PluginHoverPalette = {
  hoverStroke: string;
  dimOpacity: number;
  taskDimOpacity: number;
};

export function isDarkHoverSurface(themeName: string): boolean {
  return themeName === "live" || themeName === "industrial";
}

export function resolveHoverTokens(
  theme?: Pick<ChartTheme, "hover">,
): ChartThemeHover {
  return { ...defaultChartThemeHover, ...theme?.hover };
}

export function resolveHoverChrome(
  theme: Pick<ChartTheme, "name" | "hover">,
): HoverChrome {
  const tokens = resolveHoverTokens(theme);
  const dark = isDarkHoverSurface(theme.name);

  if (dark) {
    return {
      ...tokens,
      stroke: "#38bdf8",
      bandColor: "rgba(148, 163, 184, 0.1)",
      bandFollowerColor: "rgba(56, 189, 248, 0.14)",
      bandFollowerBorder: "rgba(56, 189, 248, 0.35)",
      dimOverlay: "rgba(2, 6, 23, 0.28)",
    };
  }

  return {
    ...tokens,
    stroke: "#2563eb",
    bandColor: "rgba(100, 116, 139, 0.08)",
    bandFollowerColor: "rgba(59, 130, 246, 0.12)",
    bandFollowerBorder: "rgba(59, 130, 246, 0.25)",
    dimOverlay: "rgba(248, 250, 252, 0.45)",
  };
}

/** SVG plugin charts (map, geo, gantt) — surface prop instead of theme name. */
export function resolvePluginHoverPalette(
  surface: "light" | "dark",
  theme?: Pick<ChartTheme, "hover">,
): PluginHoverPalette {
  const tokens = resolveHoverTokens(theme);
  return {
    hoverStroke: surface === "dark" ? "#38bdf8" : "#2563eb",
    dimOpacity: tokens.dimOpacity,
    taskDimOpacity: tokens.taskDimOpacity,
  };
}
