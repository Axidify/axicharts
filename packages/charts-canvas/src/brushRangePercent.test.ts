import { describe, expect, it } from "vitest";
import {
  brushRangeFromIndices,
  brushRangeFromIndicesWithMinGuard,
  indicesFromBrushRange,
  isEmptyBrushRangePercent,
  normalizeBrushRangePercent,
} from "./brushRangePercent";

describe("brushRangePercent", () => {
  it("round-trips index windows for ten categories", () => {
    const range = brushRangeFromIndices(0, 4, 10);
    expect(range).toEqual({ start: 0, end: 50 });

    const indices = indicesFromBrushRange({ start: 0, end: 45 }, 10);
    expect(indices.startIndex).toBe(0);
    expect(indices.endIndex).toBe(4);
  });

  it("enforces a minimum span when normalizing", () => {
    const normalized = normalizeBrushRangePercent({ start: 40, end: 41 }, 5);
    expect(normalized.end - normalized.start).toBeGreaterThanOrEqual(5);
  });

  it("applies min guard when mapping drag indices", () => {
    const range = brushRangeFromIndicesWithMinGuard(10, 10, 100, 5);
    expect(range.end - range.start).toBeGreaterThanOrEqual(5);
  });

  it("detects empty percent ranges", () => {
    expect(isEmptyBrushRangePercent(null)).toBe(true);
    expect(isEmptyBrushRangePercent({ start: 20, end: 20 })).toBe(true);
    expect(isEmptyBrushRangePercent({ start: 10, end: 30 })).toBe(false);
  });
});
