import type { SeriesTone } from "@axicharts/charts-canvas";
import type { BuiltinTickFormat } from "@axicharts/charts-core";

export type LineMarkProps = {
  dataKey: string;
  name?: string;
  tone?: SeriesTone;
  yAxisId?: string;
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

export const Line = Object.assign(lineMark, { markKind: "line" as const });
export const Bar = Object.assign(barMark, { markKind: "bar" as const });
export const Area = Object.assign(areaMark, { markKind: "area" as const });
export const XAxis = Object.assign(xAxisMark, { markKind: "xAxis" as const });
export const YAxis = Object.assign(yAxisMark, { markKind: "yAxis" as const });
export const Grid = Object.assign(gridMark, { markKind: "grid" as const });
export const Tooltip = Object.assign(chromeMark, { markKind: "tooltip" as const });
export const Legend = Object.assign(chromeMark, { markKind: "legend" as const });

export type ComposableMarkKind =
  | typeof Line.markKind
  | typeof Bar.markKind
  | typeof Area.markKind
  | typeof XAxis.markKind
  | typeof YAxis.markKind
  | typeof Grid.markKind
  | typeof Tooltip.markKind
  | typeof Legend.markKind;

export type ComposableMarkType =
  | typeof Line
  | typeof Bar
  | typeof Area
  | typeof XAxis
  | typeof YAxis
  | typeof Grid
  | typeof Tooltip
  | typeof Legend;
