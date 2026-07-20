import { categoryAxisSizeForLabels } from "@axicharts/charts-canvas";

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
  orientation = "vertical",
  categories = [],
}: {
  height: number;
  dualAxis?: boolean;
  showLegend?: boolean;
  compact?: boolean;
  orientation?: "vertical" | "horizontal";
  categories?: string[];
}): CartesianPlotInsets {
  const isCompact = compact ?? height < 72;
  if (isCompact) {
    return { top: 4, right: 6, bottom: 4, left: 6 };
  }

  if (orientation === "horizontal") {
    return {
      top: 8,
      right: 14,
      bottom: 32,
      left: categoryAxisSizeForLabels(categories),
    };
  }

  const top = showLegend ? 28 : 8;
  return {
    top,
    right: dualAxis ? 48 : 14,
    bottom: 8,
    left: 14,
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
