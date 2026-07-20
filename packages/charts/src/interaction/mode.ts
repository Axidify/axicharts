import type { ChartLayoutContextValue } from "../container/ChartLayoutContext";

export type ChartMode = ChartLayoutContextValue["mode"];

export type InteractionChrome = {
  showTooltip: boolean;
  showLegend: boolean;
  showCrosshair: boolean;
};

/** Dashboard static embeds show flow legends for multi-series charts (stacked bar, combo, etc.). */
export function shouldShowCartesianLegend({
  mode,
  seriesCount,
  compact,
}: {
  mode: ChartMode;
  seriesCount: number;
  compact: boolean;
}): boolean {
  const chrome = getInteractionChrome(mode);
  return seriesCount > 1 && !compact && (chrome.showLegend || mode === "static");
}

export function getInteractionChrome(mode: ChartMode): InteractionChrome {
  switch (mode) {
    case "static":
      return {
        showTooltip: false,
        showLegend: false,
        showCrosshair: false,
      };
    case "live":
      return {
        showTooltip: false,
        showLegend: false,
        showCrosshair: true,
      };
    case "presentation":
      return {
        showTooltip: true,
        showLegend: true,
        showCrosshair: true,
      };
    case "interactive":
    default:
      return {
        showTooltip: true,
        showLegend: true,
        showCrosshair: true,
      };
  }
}
