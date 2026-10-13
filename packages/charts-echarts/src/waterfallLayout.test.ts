import { describe, expect, it } from "vitest";
import { niceCeil, waterfallAxisMax } from "./waterfallLayout";

describe("waterfall axis headroom", () => {
  it("rounds up to clean tick steps", () => {
    expect(niceCeil(1_430_000)).toBe(1_500_000);
    expect(niceCeil(1_100)).toBe(1_250);
    expect(niceCeil(230)).toBe(250);
    expect(niceCeil(48)).toBe(50);
    expect(niceCeil(0)).toBe(0);
  });

  it("leaves room above the tallest bar for top labels", () => {
    expect(waterfallAxisMax({ min: 0, max: 1_450_000 })).toBeGreaterThanOrEqual(1_450_000 * 1.1);
    expect(waterfallAxisMax({ min: 0, max: 1200 })).toBe(1500);
  });
});
