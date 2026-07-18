export type LegendVariant = "pill" | "inline" | "compact";
export type TooltipVariant = "card" | "minimal" | "dense";

const LEGEND_VARIANTS = new Set<LegendVariant>(["pill", "inline", "compact"]);
const TOOLTIP_VARIANTS = new Set<TooltipVariant>(["card", "minimal", "dense"]);

export type PanelChromeSpec = {
  legendVariant?: LegendVariant;
  tooltipVariant?: TooltipVariant;
};

export function readPanelChrome(
  props?: Record<string, unknown>,
): PanelChromeSpec {
  const legendVariant = props?.legendVariant;
  const tooltipVariant = props?.tooltipVariant;

  return {
    legendVariant:
      typeof legendVariant === "string" &&
      LEGEND_VARIANTS.has(legendVariant as LegendVariant)
        ? (legendVariant as LegendVariant)
        : undefined,
    tooltipVariant:
      typeof tooltipVariant === "string" &&
      TOOLTIP_VARIANTS.has(tooltipVariant as TooltipVariant)
        ? (tooltipVariant as TooltipVariant)
        : undefined,
  };
}

export function chartPropsWithoutChromeMeta(
  props: Record<string, unknown>,
): Record<string, unknown> {
  const {
    legendVariant: _legendVariant,
    tooltipVariant: _tooltipVariant,
    ...chartProps
  } = props;
  return chartProps;
}
