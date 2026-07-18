import { describe, expect, it } from "vitest";
import {
  brushRangeFromIndices,
  indicesFromBrushRange,
} from "./brushRangePercent";

describe("brushRangePercent", () => {
  it("round-trips index windows for ten categories", () => {
    const range = brushRangeFromIndices(0, 4, 10);
    expect(range).toEqual({ start: 0, end: 50 });

    const indices = indicesFromBrushRange({ start: 0, end: 45 }, 10);
    expect(indices.startIndex).toBe(0);
    expect(indices.endIndex).toBe(4);
  });
});
