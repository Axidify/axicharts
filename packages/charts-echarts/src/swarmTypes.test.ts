import { describe, expect, it } from "vitest";
import {
  layoutSwarmPoints,
  resolveSwarmMedian,
  swarmCategories,
} from "./swarmTypes";

describe("layoutSwarmPoints", () => {
  it("returns empty for no samples", () => {
    expect(layoutSwarmPoints([], "API")).toEqual([]);
  });

  it("places a single point at center offset", () => {
    const points = layoutSwarmPoints([42], "API");
    expect(points).toEqual([{ value: 42, xOffset: 0 }]);
  });

  it("produces deterministic offsets for the same inputs", () => {
    const samples = [12, 18, 22, 28, 35, 42, 55, 72];
    const first = layoutSwarmPoints(samples, "API");
    const second = layoutSwarmPoints(samples, "API");
    expect(second).toEqual(first);
  });

  it("varies offsets across categories", () => {
    const samples = [10, 20, 30, 40];
    const api = layoutSwarmPoints(samples, "API");
    const db = layoutSwarmPoints(samples, "DB");
    expect(api.map((point) => point.xOffset)).not.toEqual(
      db.map((point) => point.xOffset),
    );
  });

  it("keeps offsets within jitter band", () => {
    const points = layoutSwarmPoints(
      [5, 12, 18, 22, 28, 35, 42, 55, 72, 88],
      "Queue",
      0.75,
    );
    for (const point of points) {
      expect(point.xOffset).toBeGreaterThanOrEqual(-0.375);
      expect(point.xOffset).toBeLessThanOrEqual(0.375);
    }
  });
});

describe("resolveSwarmMedian", () => {
  it("returns median from values", () => {
    expect(resolveSwarmMedian({ category: "API", values: [10, 20, 30] })).toBe(
      20,
    );
  });

  it("accepts samples alias", () => {
    expect(resolveSwarmMedian({ category: "API", samples: [10, 20, 30] })).toBe(
      20,
    );
  });
});

describe("swarmCategories", () => {
  it("reads categories from items", () => {
    expect(
      swarmCategories([
        { category: "API", values: [1] },
        { category: "DB", values: [2] },
      ]),
    ).toEqual(["API", "DB"]);
  });
});
