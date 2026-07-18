import type { ReactNode } from "react";
import type { ChartGraphicElement, GraphicStyle } from "@axicharts/charts-canvas";

export type ChartGraphicMarkProps = {
  element: ChartGraphicElement;
};

export type GraphicRectMarkProps = {
  left?: number | string;
  top?: number | string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  r?: number;
  style?: GraphicStyle;
  z?: number;
  id?: string;
};

export type GraphicCircleMarkProps = {
  left?: number | string;
  top?: number | string;
  cx?: number;
  cy?: number;
  r?: number;
  style?: GraphicStyle;
  z?: number;
  id?: string;
};

export type GraphicTextMarkProps = {
  left?: number | string;
  top?: number | string;
  text?: string;
  style?: GraphicStyle;
  z?: number;
  id?: string;
};

export type GraphicLineMarkProps = {
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  style?: GraphicStyle;
  z?: number;
  id?: string;
};

export type GraphicGroupMarkProps = {
  left?: number | string;
  top?: number | string;
  children?: ReactNode;
  z?: number;
  id?: string;
};

export type GraphicImageMarkProps = {
  left?: number | string;
  top?: number | string;
  image?: string;
  width?: number;
  height?: number;
  z?: number;
  id?: string;
};

function graphicMark(_props: ChartGraphicMarkProps): null {
  return null;
}

function graphicRectMark(_props: GraphicRectMarkProps): null {
  return null;
}

function graphicCircleMark(_props: GraphicCircleMarkProps): null {
  return null;
}

function graphicTextMark(_props: GraphicTextMarkProps): null {
  return null;
}

function graphicLineMark(_props: GraphicLineMarkProps): null {
  return null;
}

function graphicGroupMark(_props: GraphicGroupMarkProps): null {
  return null;
}

function graphicImageMark(_props: GraphicImageMarkProps): null {
  return null;
}

export const ChartGraphic = Object.assign(graphicMark, {
  markKind: "graphic" as const,
});

export const GraphicRect = Object.assign(graphicRectMark, {
  markKind: "graphicRect" as const,
});

export const GraphicCircle = Object.assign(graphicCircleMark, {
  markKind: "graphicCircle" as const,
});

export const GraphicText = Object.assign(graphicTextMark, {
  markKind: "graphicText" as const,
});

export const GraphicLine = Object.assign(graphicLineMark, {
  markKind: "graphicLine" as const,
});

export const GraphicGroup = Object.assign(graphicGroupMark, {
  markKind: "graphicGroup" as const,
});

export const GraphicImage = Object.assign(graphicImageMark, {
  markKind: "graphicImage" as const,
});

export type GraphicMarkKind =
  | typeof ChartGraphic.markKind
  | typeof GraphicRect.markKind
  | typeof GraphicCircle.markKind
  | typeof GraphicText.markKind
  | typeof GraphicLine.markKind
  | typeof GraphicGroup.markKind
  | typeof GraphicImage.markKind;
