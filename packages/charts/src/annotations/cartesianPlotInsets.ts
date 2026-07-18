export type CartesianPlotInsets = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

/** Match uPlot cartesian padding used by `UPlotLine` / `UPlotBar`. */
export function resolveCartesianPlotInsets({
  height,
  dualAxis = false,
  showLegend = false,
  compact,
}: {
  height: number;
  dualAxis?: boolean;
  showLegend?: boolean;
  compact?: boolean;
}): CartesianPlotInsets {
  const isCompact = compact ?? height < 72;
  if (isCompact) {
    return { top: 4, right: 6, bottom: 4, left: 6 };
  }

  const top = showLegend ? 28 : 8;
  return {
    top,
    right: 14,
    bottom: 8,
    left: dualAxis ? 48 : 14,
  };
}

export function plotInnerSize(
  width: number,
  height: number,
  insets: CartesianPlotInsets,
): { width: number; height: number } {
  return {
    width: Math.max(1, width - insets.left - insets.right),
    height: Math.max(1, height - insets.top - insets.bottom),
  };
}
