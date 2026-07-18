import { useMemo, type ReactNode } from "react";
import {
  resolveAnnotationPlotProps,
  type ChartAnnotation,
  type PlotMarkerAnnotation,
  type ReferenceLine,
  type ThresholdBand,
} from "@axicharts/charts-canvas";
import { composeCartesianAnnotations } from "../composable/composeCartesianAnnotations";

export function useCartesianAnnotations({
  annotations,
  thresholdBands,
  referenceLines,
  children,
}: {
  annotations?: ChartAnnotation[];
  thresholdBands?: ThresholdBand[];
  referenceLines?: ReferenceLine[];
  children?: ReactNode;
}): {
  thresholdBands: ThresholdBand[];
  referenceLines: ReferenceLine[];
  annotations?: ChartAnnotation[];
  draggableMarkers: PlotMarkerAnnotation[];
} {
  const composedAnnotations = useMemo(
    () => composeCartesianAnnotations(children),
    [children],
  );

  const mergedAnnotations = useMemo(
    () => [...composedAnnotations, ...(annotations ?? [])],
    [composedAnnotations, annotations],
  );

  const resolved = useMemo(
    () =>
      resolveAnnotationPlotProps({
        annotations: mergedAnnotations,
        thresholdBands,
        referenceLines,
      }),
    [mergedAnnotations, thresholdBands, referenceLines],
  );

  const draggableMarkers = useMemo(
    () => resolved.markers.filter((marker) => marker.draggable),
    [resolved.markers],
  );

  return {
    thresholdBands: resolved.thresholdBands,
    referenceLines: resolved.referenceLines,
    annotations: mergedAnnotations.length > 0 ? mergedAnnotations : undefined,
    draggableMarkers,
  };
}
