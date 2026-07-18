import { describe, expect, it } from "vitest";
import {
  hasCustomLineDraw,
  hasPerPointSizes,
  hasSegmentedFills,
} from "./segmentedLineDraw";

describe("segmentedLineDraw helpers", () => {
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

  it("detects per-point size arrays on series", () => {
    expect(
      hasPerPointSizes([{ name: "A", data: [1, 2], sizes: [4, 8] }]),
    ).toBe(true);
  });

  it("detects custom line draw when fills or sizes are present", () => {
    expect(hasCustomLineDraw([{ name: "A", data: [1, 2], sizes: [4, 8] }])).toBe(
      true,
    );
    expect(hasCustomLineDraw([{ name: "A", data: [1, 2] }])).toBe(false);
  });
});
