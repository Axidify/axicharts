import { describe, expect, it } from "vitest";
import { cleanTheme } from "@axicharts/charts-theme";
import {
  pieCenterMetricGraphics,
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

describe("pieCenterMetricGraphics", () => {
  it("anchors the metric group at the lifted pie center for legend mode", () => {
    const graphics = pieCenterMetricGraphics(
      { value: "48%", label: "Chrome" },
      cleanTheme,
      "legend",
      360,
      257,
    );
    expect(graphics[0]?.type).toBe("group");
    expect(graphics[0]?.left).toBe("50%");
    expect(graphics[0]?.top).toBe("46%");
    expect(graphics[0]?.children?.[0]?.style?.text).toBe("48%");
    expect(graphics[0]?.children?.[1]?.style?.text).toBe("Chrome");
  });

  it("uses smaller type on compact tiles", () => {
    const graphics = pieCenterMetricGraphics(
      { value: "48%", label: "Chrome" },
      cleanTheme,
      "legend",
      360,
      257,
    );
    expect(graphics[0]?.children?.[0]?.style?.fontSize).toBe(18);
    expect(graphics[0]?.children?.[1]?.style?.fontSize).toBe(10);
  });
});
