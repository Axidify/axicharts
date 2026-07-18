import type { ChartAnnotation } from "@axicharts/charts-canvas";
import type { AnnotationSpec, PanelSpec } from "./types";

export type { AnnotationSpec };

export function readPanelAnnotations(
  spec: PanelSpec,
): ChartAnnotation[] | undefined {
  const topLevel = spec.annotations;
  const fromProps = spec.props?.annotations;
  if (Array.isArray(topLevel) && topLevel.length > 0) {
    return topLevel as ChartAnnotation[];
  }
  if (Array.isArray(fromProps) && fromProps.length > 0) {
    return fromProps as ChartAnnotation[];
  }
  return undefined;
}

export function panelPropsWithAnnotations<T extends Record<string, unknown>>(
  spec: PanelSpec,
  props: T,
): T {
  const annotations = readPanelAnnotations(spec);
  if (!annotations) return props;
  return { ...props, annotations };
}
