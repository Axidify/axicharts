"use client";

import { useMemo, type ReactElement } from "react";
import type { ChartGraphicElement, GraphicStyle } from "@axicharts/charts-canvas";
import {
  resolveCartesianPlotInsets,
  plotInnerSize,
} from "../annotations/cartesianPlotInsets";
import {
  resolveGraphicCoord,
  type GraphicPlotContext,
} from "./resolveGraphicCoords";

type GraphicOverlayProps = {
  width: number;
  height: number;
  graphics: ChartGraphicElement[];
  categories: string[];
  yMin: number;
  yMax: number;
  dualAxis?: boolean;
};

function sortedGraphics(graphics: ChartGraphicElement[]): ChartGraphicElement[] {
  return [...graphics].sort((a, b) => (a.z ?? 0) - (b.z ?? 0));
}

function renderStyle(style?: GraphicStyle): React.CSSProperties {
  if (!style) return {};
  return {
    fill: style.fill,
    stroke: style.stroke,
    strokeWidth: style.lineWidth,
    opacity: style.opacity,
    fontSize: style.fontSize,
    fontWeight: style.fontWeight,
  };
}

function renderElement(
  element: ChartGraphicElement,
  ctx: GraphicPlotContext,
  key: string,
  offsetX = 0,
  offsetY = 0,
): ReactElement | null {
  switch (element.type) {
    case "rect": {
      const left =
        resolveGraphicCoord(element.left, "x", ctx) ??
        (element.shape?.x != null ? ctx.insets.left + element.shape.x + offsetX : undefined);
      const top =
        resolveGraphicCoord(element.top, "y", ctx) ??
        (element.shape?.y != null ? ctx.insets.top + element.shape.y + offsetY : undefined);
      if (left == null || top == null) return null;
      const w = element.shape?.width ?? 0;
      const h = element.shape?.height ?? 0;
      return (
        <rect
          key={key}
          x={left}
          y={top}
          width={w}
          height={h}
          rx={element.shape?.r}
          style={renderStyle(element.style)}
        />
      );
    }
    case "circle": {
      const cx =
        resolveGraphicCoord(element.left, "x", ctx) ??
        (element.shape?.cx != null ? ctx.insets.left + element.shape.cx + offsetX : undefined);
      const cy =
        resolveGraphicCoord(element.top, "y", ctx) ??
        (element.shape?.cy != null ? ctx.insets.top + element.shape.cy + offsetY : undefined);
      if (cx == null || cy == null) return null;
      return (
        <circle
          key={key}
          cx={cx}
          cy={cy}
          r={element.shape?.r ?? 4}
          style={renderStyle(element.style)}
        />
      );
    }
    case "text": {
      const left = resolveGraphicCoord(element.left, "x", ctx);
      const top = resolveGraphicCoord(element.top, "y", ctx);
      if (left == null || top == null) return null;
      return (
        <text
          key={key}
          x={left + offsetX}
          y={top + offsetY}
          fill={element.style?.fill ?? "#0f172a"}
          fontSize={element.style?.fontSize ?? 12}
          fontWeight={element.style?.fontWeight}
          opacity={element.style?.opacity}
        >
          {element.style?.text ?? ""}
        </text>
      );
    }
    case "line": {
      const x1 =
        element.shape?.x1 != null
          ? ctx.insets.left + element.shape.x1 + offsetX
          : undefined;
      const y1 =
        element.shape?.y1 != null
          ? ctx.insets.top + element.shape.y1 + offsetY
          : undefined;
      const x2 =
        element.shape?.x2 != null
          ? ctx.insets.left + element.shape.x2 + offsetX
          : undefined;
      const y2 =
        element.shape?.y2 != null
          ? ctx.insets.top + element.shape.y2 + offsetY
          : undefined;
      if (x1 == null || y1 == null || x2 == null || y2 == null) return null;
      return (
        <line
          key={key}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          style={renderStyle(element.style)}
        />
      );
    }
    case "image": {
      const left = resolveGraphicCoord(element.left, "x", ctx);
      const top = resolveGraphicCoord(element.top, "y", ctx);
      if (left == null || top == null || !element.style?.image) return null;
      return (
        <image
          key={key}
          href={element.style.image}
          x={left + offsetX}
          y={top + offsetY}
          width={element.style.width ?? 24}
          height={element.style.height ?? 24}
        />
      );
    }
    case "group": {
      const left = resolveGraphicCoord(element.left, "x", ctx) ?? 0;
      const top = resolveGraphicCoord(element.top, "y", ctx) ?? 0;
      const children = (element.children ?? [])
        .map((child, index) =>
          renderElement(child, ctx, `${key}-${index}`, 0, 0),
        )
        .filter((node): node is ReactElement => node != null);
      if (children.length === 0) return null;
      return (
        <g key={key} transform={`translate(${left}, ${top})`} data-graphic-group={element.id}>
          {children}
        </g>
      );
    }
    default:
      return null;
  }
}

export function GraphicOverlay({
  width,
  height,
  graphics,
  categories,
  yMin,
  yMax,
  dualAxis = false,
}: GraphicOverlayProps): ReactElement | null {
  const insets = useMemo(
    () => resolveCartesianPlotInsets({ height, dualAxis }),
    [height, dualAxis],
  );

  const ctx = useMemo<GraphicPlotContext>(
    () => ({
      width,
      height,
      insets,
      categories,
      yMin,
      yMax,
    }),
    [width, height, insets, categories, yMin, yMax],
  );

  const nodes = useMemo(
    () =>
      sortedGraphics(graphics)
        .map((element, index) =>
          renderElement(element, ctx, element.id ?? `graphic-${index}`),
        )
        .filter((node): node is ReactElement => node != null),
    [graphics, ctx],
  );

  if (nodes.length === 0) return null;

  const { width: innerW, height: innerH } = plotInnerSize(width, height, insets);

  return (
    <svg
      aria-hidden
      className="axicharts-graphic-overlay"
      width={width}
      height={height}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 1,
      }}
      viewBox={`0 0 ${width} ${height}`}
    >
      <defs>
        <clipPath id="axicharts-plot-clip">
          <rect
            x={insets.left}
            y={insets.top}
            width={innerW}
            height={innerH}
          />
        </clipPath>
      </defs>
      <g clipPath="url(#axicharts-plot-clip)">{nodes}</g>
    </svg>
  );
}
