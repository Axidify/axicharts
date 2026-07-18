import { describe, expect, it } from "vitest";
import { hasSegmentedFills } from "./segmentedLineDraw";

describe("hasSegmentedFills", () => {
  it("detects per-point fill arrays on series", () => {
    expect(
      hasSegmentedFills([
        { name: "A", data: [1, 2] },
        { name: "B", data: [3, 4], fills: ["#111", "#222"] },
      ]),
    ).toBe(true);
  });

  it("returns false when no fills are present", () => {
    expect(hasSegmentedFills([{ name: "A", data: [1, 2] }])).toBe(false);
  });
});
