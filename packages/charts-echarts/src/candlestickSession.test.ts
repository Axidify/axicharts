import { describe, expect, it } from "vitest";
import { buildSessionMarkAreas } from "./candlestickSession";
import { liveTheme } from "@axicharts/charts-theme";

describe("buildSessionMarkAreas", () => {
  const categories = [
    "08:00",
    "08:30",
    "09:00",
    "09:30",
    "10:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
  ];

  it("returns pre-market and after-hours bands for HH:MM categories", () => {
    const bands = buildSessionMarkAreas(categories, "rth", liveTheme);
    expect(bands).toHaveLength(2);
    expect(bands[0]).toMatchObject({
      name: "Pre-market",
      startIndex: 0,
      endIndex: 2,
    });
    expect(bands[1]).toMatchObject({
      name: "After-hours",
      startIndex: 6,
      endIndex: 8,
    });
  });

  it("returns empty when categories are not time labels", () => {
    expect(buildSessionMarkAreas(["Mon", "Tue"], "rth", liveTheme)).toEqual([]);
  });

  it("returns empty when session shading is disabled", () => {
    expect(buildSessionMarkAreas(categories, false, liveTheme)).toEqual([]);
  });
});
