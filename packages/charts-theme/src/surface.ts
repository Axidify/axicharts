import type { ChartTheme } from "./themes";

/** Built-in dark themes predating `ChartTheme.surface`. */
const DARK_THEME_NAMES = new Set(["live", "industrial"]);

/**
 * Whether a theme renders on a dark surface. Prefers the explicit
 * `theme.surface`, so brand forks made with `createTheme(liveTheme, { name })`
 * stay dark; falls back to the built-in theme names.
 */
export function isDarkTheme(theme: Pick<ChartTheme, "name" | "surface">): boolean {
  if (theme.surface) return theme.surface === "dark";
  return DARK_THEME_NAMES.has(theme.name);
}
