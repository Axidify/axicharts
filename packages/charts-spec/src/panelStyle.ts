import { createTheme, type ChartTheme } from "@axicharts/charts-theme";
import type { PanelStyleSpec } from "./types";

export function readPanelStyle(
  props?: Record<string, unknown>,
): PanelStyleSpec | undefined {
  const style = props?.style;
  if (!style || typeof style !== "object" || Array.isArray(style)) {
    return undefined;
  }
  return style as PanelStyleSpec;
}

export function chartPropsWithoutStyle(
  props: Record<string, unknown>,
): Record<string, unknown> {
  const { style: _style, ...chartProps } = props;
  return chartProps;
}

export function themeWithPanelStyle(
  base: ChartTheme,
  style?: PanelStyleSpec,
): ChartTheme {
  if (!style) return base;

  const hasOverrides = Object.values(style).some(
    (section) => section && Object.keys(section).length > 0,
  );
  if (!hasOverrides) return base;

  return createTheme(base, {
    name: `${base.name}-panel`,
    grid: style.grid,
    line: style.line,
    area: style.area,
    bar: style.bar,
  });
}
