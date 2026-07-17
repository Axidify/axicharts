import type { ChartLayoutContextValue } from "../container/ChartLayoutContext";

export type ChartMode = ChartLayoutContextValue["mode"];

export type InteractionChrome = {
  showTooltip: boolean;
  showLegend: boolean;
  showCrosshair: boolean;
};

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
