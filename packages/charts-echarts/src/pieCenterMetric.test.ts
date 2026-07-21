import { describe, expect, it } from "vitest";
import {
  pieCenterPixels,
  resolveLargestSliceMetric,
  resolvePieCenterMetric,
} from "./pieCenterMetric";

const SLICES = [
  { name: "Chrome", value: 48 },
  { name: "Safari", value: 28 },
  { name: "Firefox", value: 14 },
  { name: "Other", value: 10 },
];

describe("resolvePieCenterMetric", () => {
  it("picks the largest slice share by default", () => {
    expect(resolveLargestSliceMetric(SLICES)).toEqual({
      value: "48%",
      label: "Chrome",
    });
    expect(resolvePieCenterMetric(SLICES, "largest")).toEqual({
      value: "48%",
      label: "Chrome",
    });
  });

  it("accepts explicit value and label", () => {
    expect(
      resolvePieCenterMetric(SLICES, { value: "48%", label: "Chrome" }),
    ).toEqual({
      value: "48%",
      label: "Chrome",
    });
  });
});

describe("pieCenterPixels", () => {
  it("maps legend-mode center to lifted pixel coords", () => {
    expect(pieCenterPixels("legend", 360, 257)).toEqual({
      x: 180,
      y: Math.round(257 * 0.46),
    });
  });
});
