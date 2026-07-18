import type { LineCurve } from "@axicharts/charts-theme";

type Point = { x: number; y: number };

function sign(value: number): number {
  return value < 0 ? -1 : 1;
}

/** Fritsch–Carlson monotone tangent between three points (d3 curveMonotone). */
function slope3(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number): number {
  const h0 = x1 - x0;
  const h1 = x2 - x1;
  if (h0 === 0 || h1 === 0) return 0;
  const s0 = (y1 - y0) / h0;
  const s1 = (y2 - y1) / h1;
  const p = (s0 * h1 + s1 * h0) / (h0 + h1);
  return (sign(s0) + sign(s1)) * Math.min(Math.abs(s0), Math.abs(s1), 0.5 * Math.abs(p)) || 0;
}

function slope2(x0: number, y0: number, x1: number, y1: number): number {
  const dx = x1 - x0;
  if (dx === 0) return 0;
  return (y1 - y0) / dx;
}

/** Pixel-space monotone tangents (dy/dx) for a polyline. */
export function monotoneTangents(points: Point[]): number[] {
  const n = points.length;
  if (n < 2) return [];

  const tangents = new Array<number>(n);
  const p0 = points[0]!;
  const p1 = points[1]!;
  tangents[0] = slope2(p0.x, p0.y, p1.x, p1.y);

  for (let index = 1; index < n - 1; index++) {
    const prev = points[index - 1]!;
    const current = points[index]!;
    const next = points[index + 1]!;
    tangents[index] = slope3(prev.x, prev.y, current.x, current.y, next.x, next.y);
  }

  const plast = points[n - 2]!;
  const pend = points[n - 1]!;
  tangents[n - 1] = slope2(plast.x, plast.y, pend.x, pend.y);
  return tangents;
}

export type MonotoneControlPoints = {
  cp1x: number;
  cp1y: number;
  cp2x: number;
  cp2y: number;
};

export function monotoneBezierControls(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  m0: number,
  m1: number,
): MonotoneControlPoints {
  const dx = (x1 - x0) / 3;
  return {
    cp1x: x0 + dx,
    cp1y: y0 + m0 * dx,
    cp2x: x1 - dx,
    cp2y: y1 - m1 * dx,
  };
}

/** Y on a cubic bezier at parameter t (0–1). */
export function cubicBezierY(
  y0: number,
  cp1y: number,
  cp2y: number,
  y1: number,
  t: number,
): number {
  const mt = 1 - t;
  return (
    mt * mt * mt * y0 +
    3 * mt * mt * t * cp1y +
    3 * mt * t * t * cp2y +
    t * t * t * y1
  );
}

export function strokeSegment(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  curve: LineCurve,
  m0?: number,
  m1?: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  if (curve === "monotone" && m0 != null && m1 != null) {
    const { cp1x, cp1y, cp2x, cp2y } = monotoneBezierControls(x0, y0, x1, y1, m0, m1);
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x1, y1);
  } else {
    ctx.lineTo(x1, y1);
  }
  ctx.stroke();
}

export function fillAreaUnderSegment(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  baseline: number,
  curve: LineCurve,
  m0?: number,
  m1?: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x0, baseline);
  ctx.lineTo(x0, y0);
  if (curve === "monotone" && m0 != null && m1 != null) {
    const { cp1x, cp1y, cp2x, cp2y } = monotoneBezierControls(x0, y0, x1, y1, m0, m1);
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x1, y1);
  } else {
    ctx.lineTo(x1, y1);
  }
  ctx.lineTo(x1, baseline);
  ctx.closePath();
}
