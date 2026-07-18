export type ScatterLabelDensity = "sparse" | "dense" | "crowded";

export type ScatterAxisLayout = {
  compact: boolean;
  nameFontSize: number;
  axisFontSize: number;
  xNameGap: number;
  yNameGap: number;
  gridTop: number;
  gridBottom: number;
  gridLeft: number;
  labelDensity: ScatterLabelDensity;
  labelFontSize: number;
  hideOverlap: boolean;
};

export function scatterLabelDensity(pointCount: number): ScatterLabelDensity {
  if (pointCount <= 8) return "sparse";
  if (pointCount <= 20) return "dense";
  return "crowded";
}

export function scatterLabelFontSize(
  density: ScatterLabelDensity,
  compact: boolean,
): number {
  if (density === "crowded") return compact ? 8 : 9;
  if (density === "dense") return compact ? 9 : 10;
  return compact ? 9 : 10;
}

export function resolveScatterAxisLayout(
  width: number,
  height: number,
  options: {
    pointCount: number;
    showLegend?: boolean;
    showPointLabels?: boolean;
    xLabel?: string;
    yLabel?: string;
  },
): ScatterAxisLayout {
  const compact = height < 200 || width < 280;
  const density = scatterLabelDensity(options.pointCount);

  return {
    compact,
    nameFontSize: compact ? 9 : 11,
    axisFontSize: compact ? 10 : 11,
    xNameGap: compact ? 20 : 28,
    yNameGap: compact ? 32 : 40,
    gridTop: options.showLegend
      ? 28
      : options.showPointLabels
        ? compact
          ? 18
          : 22
        : compact
          ? 12
          : 16,
    gridBottom: options.xLabel ? (compact ? 30 : 36) : compact ? 20 : 24,
    gridLeft: options.yLabel ? (compact ? 40 : 48) : 8,
    labelDensity: density,
    labelFontSize: scatterLabelFontSize(density, compact),
    hideOverlap: density !== "sparse",
  };
}
