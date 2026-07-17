import { describe, expect, it } from "vitest";
import { downsampleIndicesLTTB, downsampleLTTB } from "./lttb";

describe("downsampleLTTB", () => {
  it("returns the input when under threshold", () => {
    const points = [
      { x: 0, y: 1 },
      { x: 1, y: 2 },
      { x: 2, y: 1 },
    ];
    expect(downsampleLTTB(points, 10)).toEqual(points);
  });

  it("always keeps first and last points", () => {
    const points = Array.from({ length: 20 }, (_, x) => ({
      x,
      y: Math.sin(x / 2),
    }));
    const sampled = downsampleLTTB(points, 6);
    expect(sampled[0]).toEqual(points[0]);
    expect(sampled[sampled.length - 1]).toEqual(points[points.length - 1]);
    expect(sampled).toHaveLength(6);
  });

  it("preserves spikes in the downsampled series", () => {
    const values = Array.from({ length: 100 }, (_, index) =>
      index === 50 ? 100 : 1,
    );
    const indices = downsampleIndicesLTTB(values, 12);
    expect(indices).toContain(50);
    expect(indices[0]).toBe(0);
    expect(indices[indices.length - 1]).toBe(99);
  });
});
