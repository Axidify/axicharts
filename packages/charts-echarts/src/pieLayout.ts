import type { ChartTheme } from "@axicharts/charts-theme";
import { isCompactTile } from "./themeBridge";

export type PieLabelMode = "none" | "external" | "legend";

/** Dashboard tiles use a bottom legend; larger panels use outside labels + leader lines. */
export function pieLabelMode(
  width: number,
  height: number,
  showLabels: boolean,
): PieLabelMode {
  if (!showLabels) return "none";
  return isCompactTile(width, height) ? "legend" : "external";
}

export function pieCenter(labelMode: PieLabelMode): [string, string] {
  if (labelMode === "legend") return ["50%", "46%"];
  return ["50%", "50%"];
}

export function pieOuterRadius(
  theme: ChartTheme,
  innerRadius: number,
  labelMode: PieLabelMode = "external",
): string | [string, string] {
  const outer =
    labelMode === "legend"
      ? innerRadius > 0
        ? "68%"
        : "62%"
      : theme.name === "presentation"
        ? "72%"
        : "70%";
  return innerRadius > 0 ? [`${innerRadius}%`, outer] : outer;
}

/** Dashboard donuts must not translate slices on hover — only presentation may scale. */
export function pieEmphasisOptions(presentation: boolean): {
  scale: boolean;
  scaleSize?: number;
  focus: "none" | "self";
  itemStyle: {
    shadowBlur: number;
    shadowOffsetX: number;
    shadowColor: string;
  };
} {
  if (presentation) {
    return {
      scale: true,
      scaleSize: 6,
      focus: "self",
      itemStyle: {
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowColor: "rgba(15, 23, 42, 0.12)",
      },
    };
  }

  return {
    scale: false,
    focus: "none",
    itemStyle: {
      shadowBlur: 0,
      shadowOffsetX: 0,
      shadowColor: "transparent",
    },
  };
}
