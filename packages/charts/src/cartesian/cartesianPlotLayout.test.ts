import { describe, expect, it } from "vitest";
import { cartesianPlotHeight } from "./cartesianPlotLayout";

describe("cartesianPlotHeight", () => {
  it("uses the full plot slot height when no overview is present", () => {
    expect(cartesianPlotHeight({ width: 320, height: 176 })).toBe(176);
  });

  it("subtracts overview height for brushed charts", () => {
    expect(cartesianPlotHeight({ width: 320, height: 200 }, 40)).toBe(160);
  });
});
