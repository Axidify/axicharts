import type { ReferenceLine, SeriesTone, ThresholdBand } from "./types";

export type ChartAnnotation =
  | {
      type: "label";
      text: string;
      x?: number | string;
      y: number;
      tone?: SeriesTone;
      position?: "top" | "bottom" | "left" | "right" | "center";
      id?: string;
    }
  | {
      type: "band";
      min: number;
      max: number;
      label?: string;
      tone?: SeriesTone;
      id?: string;
    }
  | {
      type: "line";
      value: number;
      label?: string;
      tone?: SeriesTone;
      orientation?: "horizontal" | "vertical";
      x?: number | string;
      id?: string;
    }
  | {
      type: "marker";
      x?: number | string;
      y: number;
      label?: string;
      tone?: SeriesTone;
      draggable?: boolean;
      id?: string;
    };

export type PlotVerticalLine = {
  x: number | string;
  label?: string;
  tone?: SeriesTone;
};

export type PlotLabelAnnotation = {
  text: string;
  x?: number | string;
  y: number;
  tone?: SeriesTone;
  position?: "top" | "bottom" | "left" | "right" | "center";
};

export type PlotMarkerAnnotation = {
  x?: number | string;
  y: number;
  label?: string;
  tone?: SeriesTone;
  draggable?: boolean;
  id?: string;
};

export type ResolvedPlotAnnotations = {
  thresholdBands: ThresholdBand[];
  referenceLines: ReferenceLine[];
  verticalLines: PlotVerticalLine[];
  labels: PlotLabelAnnotation[];
  markers: PlotMarkerAnnotation[];
};

export function categoryToIndex(
  x: number | string | undefined,
  categories: string[],
): number | null {
  if (x == null) return null;
  if (typeof x === "number") {
    if (Number.isInteger(x) && x >= 0 && x < categories.length) return x;
    return null;
  }
  const idx = categories.indexOf(x);
  return idx >= 0 ? idx : null;
}

export function resolvePlotAnnotations(
  input: {
    annotations?: ChartAnnotation[];
    thresholdBands?: ThresholdBand[];
    referenceLines?: ReferenceLine[];
  } = {},
): ResolvedPlotAnnotations {
  const thresholdBands: ThresholdBand[] = [...(input.thresholdBands ?? [])];
  const referenceLines: ReferenceLine[] = [...(input.referenceLines ?? [])];
  const verticalLines: PlotVerticalLine[] = [];
  const labels: PlotLabelAnnotation[] = [];
  const markers: PlotMarkerAnnotation[] = [];

  for (const ann of input.annotations ?? []) {
    switch (ann.type) {
      case "band":
        thresholdBands.push({
          min: ann.min,
          max: ann.max,
          label: ann.label,
          tone: ann.tone,
        });
        break;
      case "line":
        if (ann.orientation === "vertical") {
          verticalLines.push({
            x: ann.x ?? 0,
            label: ann.label,
            tone: ann.tone,
          });
        } else {
          referenceLines.push({
            value: ann.value,
            label: ann.label,
            tone: ann.tone,
          });
        }
        break;
      case "label":
        labels.push({
          text: ann.text,
          x: ann.x,
          y: ann.y,
          tone: ann.tone,
          position: ann.position,
        });
        break;
      case "marker":
        markers.push({
          x: ann.x,
          y: ann.y,
          label: ann.label,
          tone: ann.tone,
          draggable: ann.draggable,
          id: ann.id,
        });
        break;
    }
  }

  return {
    thresholdBands,
    referenceLines,
    verticalLines,
    labels,
    markers,
  };
}

export function extraYValuesFromAnnotations(
  resolved: ResolvedPlotAnnotations,
): number[] {
  const values: number[] = [];
  for (const label of resolved.labels) {
    values.push(label.y);
  }
  for (const marker of resolved.markers) {
    values.push(marker.y);
  }
  return values;
}

export type AnnotationPlotProps = {
  annotations?: ChartAnnotation[];
  thresholdBands?: ThresholdBand[];
  referenceLines?: ReferenceLine[];
  verticalLines?: PlotVerticalLine[];
  plotLabels?: PlotLabelAnnotation[];
  plotMarkers?: PlotMarkerAnnotation[];
};

export function resolveAnnotationPlotProps(
  props: AnnotationPlotProps,
): ResolvedPlotAnnotations & { extraY: number[] } {
  const resolved = resolvePlotAnnotations({
    annotations: props.annotations,
    thresholdBands: props.thresholdBands,
    referenceLines: props.referenceLines,
  });

  const verticalLines =
    props.verticalLines && props.verticalLines.length > 0
      ? props.verticalLines
      : resolved.verticalLines;
  const labels =
    props.plotLabels && props.plotLabels.length > 0
      ? props.plotLabels
      : resolved.labels;
  const markers =
    props.plotMarkers && props.plotMarkers.length > 0
      ? props.plotMarkers
      : resolved.markers;

  return {
    thresholdBands: resolved.thresholdBands,
    referenceLines: resolved.referenceLines,
    verticalLines,
    labels,
    markers,
    extraY: extraYValuesFromAnnotations({
      ...resolved,
      labels,
      markers,
    }),
  };
}
