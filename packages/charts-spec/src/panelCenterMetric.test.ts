import { describe, expect, it } from "vitest";
import { readPanelCenterMetric } from "./panelCenterMetric";

const SLICES = [
  { name: "Chrome", value: 48 },
  { name: "Safari", value: 28 },
];

describe("readPanelCenterMetric", () => {
  it("returns largest mode unchanged", () => {
    expect(readPanelCenterMetric({ centerMetric: "largest" }, SLICES)).toBe("largest");
  });

  it("passes through explicit value and label", () => {
    expect(
      readPanelCenterMetric({ centerMetric: { value: "48%", label: "Chrome" } }, SLICES),
    ).toEqual({ value: "48%", label: "Chrome" });
  });

  it("resolves a named slice to share and label", () => {
    expect(readPanelCenterMetric({ centerMetric: { slice: "Safari" } }, SLICES)).toEqual({
      value: "37%",
      label: "Safari",
    });
  });
});
