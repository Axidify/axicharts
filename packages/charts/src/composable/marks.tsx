import type { ReactNode } from "react";
import type { SeriesTone } from "@axicharts/charts-canvas";
import type { BuiltinTickFormat } from "@axicharts/charts-core";
import type { BarRenderFn, PathRenderFn } from "./customMarks";

export type LineMarkProps = {
  dataKey: string;
  name?: string;
  tone?: SeriesTone;
  yAxisId?: string;
  /** Recharts parity — `monotone` smooth curves, `linear` point-to-point. */
  type?: "linear" | "monotone";
  /**
   * Static SVG only — replace the default `<path>` for this series.
   * Ignored on canvas/uPlot renderers.
   */
  renderPath?: PathRenderFn;
};

export type BarMarkProps = Omit<LineMarkProps, "renderPath"> & {
  /**
   * Static SVG only — replace the default `<rect>` for each bar in this series.
   * Ignored on canvas/uPlot renderers.
   */
  renderBar?: BarRenderFn;
};

export type AreaMarkProps = LineMarkProps;

export type XAxisMarkProps = {
  dataKey: string;
  tickFormat?: BuiltinTickFormat;
};

export type YAxisMarkProps = {
  tickFormat?: BuiltinTickFormat;
  orientation?: "left" | "right";
  yAxisId?: string;
};

export type GridMarkProps = {
  horizontal?: boolean;
  vertical?: boolean;
};

export type ChromeMarkProps = Record<string, never>;

export type PieMarkProps = {
  dataKey?: string;
  nameKey?: string;
  innerRadius?: number;
  showLabels?: boolean;
  children?: ReactNode;
};

export type CellMarkProps = {
  dataKey: string;
  tone?: SeriesTone;
  /** Explicit stroke/fill color (Recharts `fill` alias supported). */
  color?: string;
  fill?: string;
  /** Bar width fraction (0–1) or point radius in px. */
  size?: number;
  radius?: number;
};

export type FunnelMarkProps = {
  dataKey?: string;
  nameKey?: string;
  sort?: "ascending" | "descending" | "none";
};

export type AnnotationLabelMarkProps = {
  text: string;
  x?: number | string;
  y: number;
  tone?: SeriesTone;
  position?: "top" | "bottom" | "left" | "right" | "center";
  id?: string;
};

export type AnnotationBandMarkProps = {
  min: number;
  max: number;
  label?: string;
  tone?: SeriesTone;
  id?: string;
};

export type AnnotationLineMarkProps = {
  value: number;
  label?: string;
  tone?: SeriesTone;
  orientation?: "horizontal" | "vertical";
  x?: number | string;
  id?: string;
};

export type AnnotationMarkerMarkProps = {
  x?: number | string;
  y: number;
  label?: string;
  tone?: SeriesTone;
  draggable?: boolean;
  id?: string;
};

/** Overlay reference line — alias for agent/human block API (RFC-002). */
export type RuleMarkProps = AnnotationLineMarkProps;

/** Overlay threshold band — alias for agent/human block API (RFC-002). */
export type BandMarkProps = AnnotationBandMarkProps;

function lineMark(_props: LineMarkProps): null {
  return null;
}

function barMark(_props: BarMarkProps): null {
  return null;
}

function areaMark(_props: AreaMarkProps): null {
  return null;
}

function xAxisMark(_props: XAxisMarkProps): null {
  return null;
}

function yAxisMark(_props: YAxisMarkProps): null {
  return null;
}

function gridMark(_props: GridMarkProps): null {
  return null;
}

function chromeMark(_props: ChromeMarkProps): null {
  return null;
}

function pieMark(_props: PieMarkProps): null {
  return null;
}

function cellMark(_props: CellMarkProps): null {
  return null;
}

function funnelMark(_props: FunnelMarkProps): null {
  return null;
}

function annotationLabelMark(_props: AnnotationLabelMarkProps): null {
  return null;
}

function annotationBandMark(_props: AnnotationBandMarkProps): null {
  return null;
}

function annotationLineMark(_props: AnnotationLineMarkProps): null {
  return null;
}

function annotationMarkerMark(_props: AnnotationMarkerMarkProps): null {
  return null;
}

function ruleMark(_props: RuleMarkProps): null {
  return null;
}

function bandMark(_props: BandMarkProps): null {
  return null;
}

export const Line = Object.assign(lineMark, { markKind: "line" as const });
export const Bar = Object.assign(barMark, { markKind: "bar" as const });
export const Area = Object.assign(areaMark, { markKind: "area" as const });
export const XAxis = Object.assign(xAxisMark, { markKind: "xAxis" as const });
export const YAxis = Object.assign(yAxisMark, { markKind: "yAxis" as const });
export const Grid = Object.assign(gridMark, { markKind: "grid" as const });
export const Tooltip = Object.assign(chromeMark, { markKind: "tooltip" as const });
export const Legend = Object.assign(chromeMark, { markKind: "legend" as const });
export const Pie = Object.assign(pieMark, { markKind: "pie" as const });
export const Cell = Object.assign(cellMark, { markKind: "cell" as const });
export const Funnel = Object.assign(funnelMark, { markKind: "funnel" as const });
export const AnnotationLabel = Object.assign(annotationLabelMark, {
  markKind: "annotationLabel" as const,
});
export const AnnotationBand = Object.assign(annotationBandMark, {
  markKind: "annotationBand" as const,
});
export const AnnotationLine = Object.assign(annotationLineMark, {
  markKind: "annotationLine" as const,
});
export const AnnotationMarker = Object.assign(annotationMarkerMark, {
  markKind: "annotationMarker" as const,
});
export const Rule = Object.assign(ruleMark, { markKind: "rule" as const });
export const Band = Object.assign(bandMark, { markKind: "band" as const });
/** Recharts-style alias for `XAxis`. */
export const X = XAxis;
/** Recharts-style alias for `YAxis`. */
export const Y = YAxis;

export type ComposableMarkKind =
  | typeof Line.markKind
  | typeof Bar.markKind
  | typeof Area.markKind
  | typeof XAxis.markKind
  | typeof YAxis.markKind
  | typeof Grid.markKind
  | typeof Tooltip.markKind
  | typeof Legend.markKind
  | typeof Pie.markKind
  | typeof Cell.markKind
  | typeof Funnel.markKind
  | typeof AnnotationLabel.markKind
  | typeof AnnotationBand.markKind
  | typeof AnnotationLine.markKind
  | typeof AnnotationMarker.markKind
  | typeof Rule.markKind
  | typeof Band.markKind;

export type ComposableMarkType =
  | typeof Line
  | typeof Bar
  | typeof Area
  | typeof XAxis
  | typeof YAxis
  | typeof Grid
  | typeof Tooltip
  | typeof Legend
  | typeof Pie
  | typeof Cell
  | typeof Funnel
  | typeof AnnotationLabel
  | typeof AnnotationBand
  | typeof AnnotationLine
  | typeof AnnotationMarker
  | typeof Rule
  | typeof Band
  | typeof X
  | typeof Y;
