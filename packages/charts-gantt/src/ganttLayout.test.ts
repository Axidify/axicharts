import { describe, expect, it } from "vitest";
import { barGeometry, resolveRange } from "./ganttLayout";
import type { GanttTask } from "./ganttLayout";

describe("resolveRange", () => {
  it("expands to include all task extents", () => {
    const tasks: GanttTask[] = [
      { name: "A", start: 2, end: 8 },
      { name: "B", start: 5, end: 12 },
    ];
    const [min, max] = resolveRange(tasks, []);
    expect(min).toBeLessThanOrEqual(2);
    expect(max).toBeGreaterThanOrEqual(12);
  });
});

describe("barGeometry", () => {
  it("returns positive bar width", () => {
    const geom = barGeometry(
      { name: "A", start: 0, end: 5 },
      0,
      32,
      [0, 10],
      80,
      200,
    );
    expect(geom.width).toBeGreaterThan(0);
    expect(geom.progressW).toBe(geom.width);
  });
});
