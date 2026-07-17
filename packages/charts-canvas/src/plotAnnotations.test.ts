import { describe, expect, it } from "vitest";
import { expandYRange } from "./plotAnnotations";

describe("expandYRange", () => {
  it("includes threshold band extents in the y range", () => {
    const [min, max] = expandYRange(40, 60, [{ min: 80, max: 95 }]);
    expect(min).toBeLessThan(40);
    expect(max).toBeGreaterThan(95);
  });

  it("includes reference lines in the y range", () => {
    const [, max] = expandYRange(10, 20, [], [{ value: 50 }]);
    expect(max).toBeGreaterThan(50);
  });
});
