import { describe, expect, it } from "vitest";
import { cleanTheme } from "@axicharts/charts-theme";
import { chromeGridStroke, isDarkChartTheme, withAlpha } from "./colors";
import { resolveSeriesColor } from "./seriesColor";

describe("chart colors", () => {
  it("cycles palette for default-toned series", () => {
    expect(resolveSeriesColor(undefined, 0)).toBe("#2563eb");
    expect(resolveSeriesColor(undefined, 1)).toBe("#0891b2");
    expect(resolveSeriesColor("warning", 0)).toBe("#d97706");
  });

  it("falls back to palette for unknown tones", () => {
    expect(resolveSeriesColor("neutral" as "default", 0)).toBe("#2563eb");
    expect(resolveSeriesColor("neutral" as "default", 2)).toBe("#16a34a");
  });

  it("uses light grid strokes on clean theme", () => {
    expect(chromeGridStroke(cleanTheme)).toBe("rgba(226, 232, 240, 0.42)");
  });

  it("ignores malformed host grid tokens that canvas would render as yellow", () => {
    const theme = {
      ...cleanTheme,
      tokens: {
        palette: ["#2563eb"],
        grid: "hsl(226 232 240 / .95)",
        axis: "#64748b",
      },
    };
    expect(chromeGridStroke(theme)).toBe("rgba(226, 232, 240, 0.42)");
  });

  it("detects dark chart themes", () => {
    expect(isDarkChartTheme("clean")).toBe(false);
    expect(isDarkChartTheme("live")).toBe(true);
  });

  it("applies alpha to hsl css token colors", () => {
    expect(withAlpha("hsl(221 83% 53%)", 0.24)).toBe("rgba(37, 99, 235, 0.24)");
    expect(withAlpha("#2563eb", 0.5)).toBe("rgba(37, 99, 235, 0.5)");
  });
});
