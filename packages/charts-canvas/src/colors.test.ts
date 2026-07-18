import { describe, expect, it } from "vitest";
import { cleanTheme } from "@axicharts/charts-theme";
import { chromeGridStroke, isDarkChartTheme } from "./colors";
import { resolveSeriesColor } from "./seriesColor";

describe("chart colors", () => {
  it("cycles palette for default-toned series", () => {
    expect(resolveSeriesColor(undefined, 0)).toBe("#2563eb");
    expect(resolveSeriesColor(undefined, 1)).toBe("#0891b2");
    expect(resolveSeriesColor("warning", 0)).toBe("#d97706");
  });

  it("uses light grid strokes on clean theme", () => {
    expect(chromeGridStroke(cleanTheme)).toBe("rgba(226, 232, 240, 0.85)");
  });

  it("detects dark chart themes", () => {
    expect(isDarkChartTheme("clean")).toBe(false);
    expect(isDarkChartTheme("live")).toBe(true);
  });
});
