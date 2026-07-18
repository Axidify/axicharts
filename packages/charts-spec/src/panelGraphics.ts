import type { ChartGraphicElement } from "@axicharts/charts-canvas";
import type { PanelSpec } from "./types";

export function readPanelGraphics(
  spec: PanelSpec,
): ChartGraphicElement[] | undefined {
  const topLevel = spec.graphics;
  const fromProps = spec.props?.graphics;
  if (Array.isArray(topLevel)) {
    return topLevel.length > 0 ? (topLevel as ChartGraphicElement[]) : [];
  }
  if (Array.isArray(fromProps)) {
    return fromProps.length > 0 ? (fromProps as ChartGraphicElement[]) : [];
  }
  return undefined;
}

export function panelPropsWithGraphics<T extends Record<string, unknown>>(
  spec: PanelSpec,
  props: T,
): T {
  const graphics = readPanelGraphics(spec);
  if (graphics === undefined) return props;
  return { ...props, graphics };
}

export function ejectGraphicsProp(spec: PanelSpec): string {
  const graphics = readPanelGraphics(spec);
  if (graphics === undefined || graphics.length === 0) return "";
  return `graphics={${JSON.stringify(graphics)}}`;
}
