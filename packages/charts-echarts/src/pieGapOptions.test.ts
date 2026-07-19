import { describe, expect, it } from "vitest";
import { presentationTheme, liveTheme } from "@axicharts/charts-theme";
import { pieGapOptions, pieOuterRadius } from "./pieLayout";

describe("pieLayout", () => {
  it("keeps full pies full and only donuts when innerRadius is set", () => {
    expect(pieOuterRadius(presentationTheme, 0)).toBe("72%");
    expect(pieOuterRadius(liveTheme, 0)).toBe("70%");
    expect(pieOuterRadius(presentationTheme, 42)).toEqual(["42%", "72%"]);
  });
});

describe("pieGapOptions", () => {
  it("renders full pies without segment gaps", () => {
    const gap = pieGapOptions(0);
    expect(gap.padAngle).toBe(0);
    expect(gap.itemStyle.borderWidth).toBe(0);
    expect(gap.itemStyle.borderRadius).toBe(0);
  });

  it("renders donuts without segment gaps but with rounded ends", () => {
    const gap = pieGapOptions(42);
    expect(gap.padAngle).toBe(0);
    expect(gap.itemStyle.borderWidth).toBe(0);
    expect(gap.itemStyle.borderRadius).toEqual([4, 4]);
  });
});
