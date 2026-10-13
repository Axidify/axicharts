import type { ChartTheme } from "./themes";

export const DEFAULT_FONT_FAMILY = "ui-sans-serif, system-ui, -apple-system, sans-serif";
export const DEFAULT_MONO_FAMILY = "ui-monospace, SFMono-Regular, Menlo, monospace";
export const DEFAULT_FONT_SIZE = 11;

export type ResolvedThemeFont = { family: string; monoFamily: string; size: number };

/** Theme typography with defaults filled in. */
export function resolveThemeFont(theme?: Pick<ChartTheme, "font">): ResolvedThemeFont {
  return {
    family: theme?.font?.family ?? DEFAULT_FONT_FAMILY,
    monoFamily: theme?.font?.monoFamily ?? DEFAULT_MONO_FAMILY,
    size: theme?.font?.size ?? DEFAULT_FONT_SIZE,
  };
}

/**
 * Canvas / CSS `font` shorthand from the theme. `delta` offsets the base size
 * (value and annotation labels use base − 1), `mono` picks the monospace family.
 */
export function themeFont(
  theme: Pick<ChartTheme, "font"> | undefined,
  { delta = 0, mono = false, weight }: { delta?: number; mono?: boolean; weight?: number } = {},
): string {
  const font = resolveThemeFont(theme);
  const size = Math.max(6, font.size + delta);
  return `${weight ? `${weight} ` : ""}${size}px ${mono ? font.monoFamily : font.family}`;
}
