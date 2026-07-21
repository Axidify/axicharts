import { describe, expect, it } from "vitest";
import { cleanTheme, liveTheme, presentationTheme } from "@axicharts/charts-theme";
import { pieGapOptions } from "./pieGapOptions";
import {
  pieCenter,
  pieEmphasisOptions,
  pieLabelMode,
  pieOuterRadius,
} from "./pieLayout";

describe("pieLayout", () => {
  it("keeps full pies full and only donuts when innerRadius is set", () => {
    expect(pieOuterRadius(presentationTheme, 0)).toBe("72%");
    expect(pieOuterRadius(liveTheme, 0)).toBe("70%");
    expect(pieOuterRadius(presentationTheme, 42)).toEqual(["42%", "72%"]);
  });

  it("shrinks donut radius and lifts center when using a bottom legend", () => {
    expect(pieOuterRadius(cleanTheme, 42, "legend")).toEqual(["42%", "68%"]);
    expect(pieOuterRadius(cleanTheme, 0, "legend")).toBe("62%");
    expect(pieCenter("legend")).toEqual(["50%", "46%"]);
  });

  it("keeps dashboard donuts stable on hover", () => {
    expect(pieEmphasisOptions(false).scale).toBe(false);
    expect(pieEmphasisOptions(true).scale).toBe(true);
  });

  it("uses bottom legend on dashboard tiles", () => {
    expect(pieLabelMode(360, 257, true)).toBe("legend");
    expect(pieLabelMode(480, 320, true)).toBe("external");
    expect(pieLabelMode(360, 257, false)).toBe("none");
  });
});

describe("pieGapOptions", () => {
  it("renders full pies without segment gaps", () => {
    const gap = pieGapOptions(0);
    expect(gap.padAngle).toBe(0);
    expect(gap.itemStyle.borderWidth).toBe(0);
    expect(gap.itemStyle.borderRadius).toBe(0);
  });

  it("renders donuts with flush segment edges", () => {
    const gap = pieGapOptions(42);
    expect(gap.padAngle).toBe(0);
    expect(gap.itemStyle.borderWidth).toBe(0);
    expect(gap.itemStyle.borderRadius).toBe(0);
  });
});
