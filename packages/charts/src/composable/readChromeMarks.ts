import { Children, isValidElement, type ReactNode } from "react";
import type { LegendMarkProps, TooltipMarkProps } from "./marks";
import { readMarkKind } from "./readMarkKind";

/** Per-chart chrome settings from composable `<Tooltip>` / `<Legend>` children. */
export type CartesianChromeSettings = {
  tooltip?: TooltipMarkProps;
  legend?: LegendMarkProps;
};

export function readChromeMarks(children: ReactNode): CartesianChromeSettings {
  const settings: CartesianChromeSettings = {};
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    const kind = readMarkKind(child.type);
    if (kind === "tooltip") settings.tooltip = child.props as TooltipMarkProps;
    if (kind === "legend") settings.legend = child.props as LegendMarkProps;
  });
  return settings;
}
