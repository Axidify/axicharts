import { Children, isValidElement, type ReactNode } from "react";
import type { SeriesTone } from "@axicharts/charts-canvas";
import { SERIES_COLORS } from "@axicharts/charts-canvas";
import { readMarkKind } from "./readMarkKind";

export type CartesianCellStyle = {
  color?: string;
  tone?: SeriesTone;
  size?: number;
};

export function resolveCellColor(style: CartesianCellStyle): string | undefined {
  if (style.color) return style.color;
  if (style.tone) return SERIES_COLORS[style.tone];
  return undefined;
}

export function readCartesianCells(markChild: ReactNode): Map<string, CartesianCellStyle> {
  const cells = new Map<string, CartesianCellStyle>();

  if (!isValidElement(markChild)) return cells;

  const markProps = markChild.props as { children?: ReactNode };
  Children.forEach(markProps.children, (cell) => {
    if (!isValidElement(cell) || readMarkKind(cell.type) !== "cell") return;
    const props = cell.props as {
      dataKey?: string;
      tone?: SeriesTone;
      color?: string;
      fill?: string;
      size?: number;
      radius?: number;
    };
    const key = props.dataKey;
    if (!key) return;
    cells.set(key, {
      color: props.color ?? props.fill,
      tone: props.tone,
      size: props.size ?? props.radius,
    });
  });

  return cells;
}
