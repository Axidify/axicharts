import type { ReactNode } from "react";
import type { SeriesTone } from "@axicharts/charts-canvas";
import type { BuiltinTickFormat } from "@axicharts/charts-core";

export type LineMarkProps = {
  dataKey: string;
  name?: string;
  tone?: SeriesTone;
  yAxisId?: string;
  /** Recharts parity — `monotone` smooth curves, `linear` point-to-point. */
  type?: "linear" | "monotone";
};

export type BarMarkProps = LineMarkProps;

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
  | typeof Funnel.markKind;

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
  | typeof Funnel;
