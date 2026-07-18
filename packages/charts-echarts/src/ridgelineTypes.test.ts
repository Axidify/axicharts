import { describe, expect, it } from "vitest";
import {
  computeKde,
  ridgeBaselineOffset,
  ridgeDensityHeight,
  resolveRidgelineDensity,
  ridgelineCategories,
} from "./ridgelineTypes";

describe("ridgelineTypes", () => {
  const samples = [10, 12, 14, 18, 22, 28, 35, 42, 55, 80];

  it("computes kde density points via shared helper", () => {
    const kde = computeKde(samples, 5, 16);
    expect(kde.length).toBe(16);
    expect(kde.some((point) => point.density > 0)).toBe(true);
  });

  it("reads categories from ridgeline series", () => {
    expect(
      ridgelineCategories([
        {
          name: "US-East",
          items: [
            { category: "API", samples: [1, 2, 3] },
            { category: "DB", samples: [4, 5, 6] },
          ],
        },
      ]),
    ).toEqual(["API", "DB"]);
  });

  it("prefers precomputed density points", () => {
    const density = [
      { value: 1, density: 0.2 },
      { value: 2, density: 0.8 },
    ];
    expect(
      resolveRidgelineDensity({
        category: "API",
        density,
      }),
    ).toEqual(density);
  });

  it("scales ridge density height within band", () => {
    expect(ridgeDensityHeight(0.5, 1, 100, 0.85)).toBeCloseTo(42.5);
    expect(ridgeDensityHeight(1, 0, 100)).toBe(0);
  });

  it("computes ridge baseline offsets top-to-bottom", () => {
    expect(ridgeBaselineOffset(0, 4)).toBe(3);
    expect(ridgeBaselineOffset(3, 4)).toBe(0);
  });
});
