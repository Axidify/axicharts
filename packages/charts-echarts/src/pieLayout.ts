import type { ChartTheme } from "@axicharts/charts-theme";

export function pieOuterRadius(
  theme: ChartTheme,
  innerRadius: number,
): string | [string, string] {
  const outer = theme.name === "presentation" ? "72%" : "70%";
  return innerRadius > 0 ? [`${innerRadius}%`, outer] : outer;
}
