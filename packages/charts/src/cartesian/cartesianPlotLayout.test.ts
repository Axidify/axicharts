import { describe, expect, it } from "vitest";
import { cartesianPlotHeight, horizontalBarMinHeight, resolveCartesianPlotSize } from "./cartesianPlotLayout";

describe("cartesianPlotHeight", () => {
  it("uses the full plot slot height when no overview is present", () => {
    expect(cartesianPlotHeight({ width: 320, height: 176 })).toBe(176);
  });

  it("subtracts overview height for brushed charts", () => {
    expect(cartesianPlotHeight({ width: 320, height: 200 }, 40)).toBe(160);
  });
});

describe("resolveCartesianPlotSize", () => {
  it("reserves flow legend height for multi-series static panels", () => {
    expect(
      resolveCartesianPlotSize(
        { width: 360, height: 257 },
        { mode: "static", seriesCount: 2, legendVariant: "inline" },
      ),
    ).toEqual({ width: 360, height: 233, compact: false });
  });

  it("keeps full height for single-series charts", () => {
    expect(
      resolveCartesianPlotSize(
        { width: 360, height: 257 },
        { mode: "static", seriesCount: 1, legendVariant: "inline" },
      ),
    ).toEqual({ width: 360, height: 257, compact: false });
  });
});

describe("horizontalBarMinHeight", () => {
  it("grows with category count", () => {
    expect(horizontalBarMinHeight(4)).toBe(160);
    expect(horizontalBarMinHeight(14)).toBe(14 * 28 + 48);
  });
});
