import { describe, expect, it } from "vitest";
import {
  bubbleSizeExtent,
  bubbleSymbolSize,
  DEFAULT_BUBBLE_SIZE_RANGE,
} from "./scatterSize";

describe("scatterSize", () => {
  it("reads bubble radius from value tuple", () => {
    expect(bubbleSymbolSize([1, 2, 18])).toBe(18);
    expect(bubbleSymbolSize([1, 2])).toBe(9);
    expect(bubbleSymbolSize([1, 2, Number.NaN])).toBe(9);
  });

  it("computes bubble size extent from series points", () => {
    expect(
      bubbleSizeExtent([
        {
          points: [
            { x: 1, y: 2, size: 8 },
            { x: 3, y: 4, size: 24 },
          ],
        },
      ]),
    ).toEqual({ min: 8, max: 24 });
  });

  it("falls back to default bubble range when no sizes are present", () => {
    expect(
      bubbleSizeExtent([
        {
          points: [{ x: 1, y: 2 }, { x: 3, y: 4 }],
        },
      ]),
    ).toEqual({
      min: DEFAULT_BUBBLE_SIZE_RANGE[0],
      max: DEFAULT_BUBBLE_SIZE_RANGE[1],
    });
  });
});
