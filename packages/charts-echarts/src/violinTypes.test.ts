import { describe, expect, it } from "vitest";
import {
  computeBoxStats,
  computeKde,
  resolveViolinDensity,
  silvermanBandwidth,
  violinCategories,
} from "./violinTypes";

describe("violinTypes", () => {
  const samples = [10, 12, 14, 18, 22, 28, 35, 42, 55, 80];

  it("computes box stats from raw samples", () => {
    const stats = computeBoxStats(samples);
    expect(stats.min).toBe(10);
    expect(stats.max).toBe(80);
    expect(stats.median).toBeGreaterThan(stats.q1);
    expect(stats.q3).toBeGreaterThan(stats.median);
  });

  it("computes kde density points", () => {
    const kde = computeKde(samples, 5, 16);
    expect(kde.length).toBe(16);
    expect(kde.some((point) => point.density > 0)).toBe(true);
  });

  it("uses silverman bandwidth when omitted", () => {
    expect(silvermanBandwidth(samples)).toBeGreaterThan(0);
  });

  it("reads categories from violin series", () => {
    expect(
      violinCategories([
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
      resolveViolinDensity({
        category: "API",
        density,
      }),
    ).toEqual(density);
  });
});
