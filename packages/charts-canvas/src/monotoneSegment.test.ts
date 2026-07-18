import { describe, expect, it } from "vitest";
import {
  cubicBezierY,
  monotoneBezierControls,
  monotoneTangents,
} from "./monotoneSegment";

describe("monotoneSegment", () => {
  it("computes tangents for a simple polyline", () => {
    const tangents = monotoneTangents([
      { x: 0, y: 0 },
      { x: 100, y: 100 },
      { x: 200, y: 0 },
    ]);
    expect(tangents).toHaveLength(3);
    expect(tangents[0]).toBeCloseTo(1, 5);
    expect(tangents[2]).toBeCloseTo(-1, 5);
  });

  it("monotone midpoint deviates above linear chord on a peak", () => {
    const x0 = 0;
    const y0 = 0;
    const x1 = 100;
    const y1 = 100;
    const tangents = monotoneTangents([
      { x: x0, y: y0 },
      { x: x1, y: y1 },
      { x: 200, y: 0 },
    ]);
    const { cp1y, cp2y } = monotoneBezierControls(
      x0,
      y0,
      x1,
      y1,
      tangents[0]!,
      tangents[1]!,
    );
    const midY = cubicBezierY(y0, cp1y, cp2y, y1, 0.5);
    expect(midY).toBeGreaterThan(50);
  });

  it("flat tangents at local extrema stay zero", () => {
    const tangents = monotoneTangents([
      { x: 0, y: 0 },
      { x: 50, y: 100 },
      { x: 100, y: 0 },
    ]);
    expect(tangents[1]).toBe(0);
  });
});
