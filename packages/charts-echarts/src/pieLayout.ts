import type { ChartTheme } from "@axicharts/charts-theme";

export function pieGapOptions(innerRadius: number): {
  padAngle: number;
  itemStyle: {
    borderWidth: number;
    borderRadius: number | [number, number];
  };
} {
  return {
    padAngle: 0,
    itemStyle: {
      borderWidth: 0,
      borderRadius: innerRadius > 0 ? [4, 4] : 0,
    },
  };
}

export function pieOuterRadius(
  theme: ChartTheme,
  innerRadius: number,
): string | [string, string] {
  const outer = theme.name === "presentation" ? "72%" : "70%";
  return innerRadius > 0 ? [`${innerRadius}%`, outer] : outer;
}
