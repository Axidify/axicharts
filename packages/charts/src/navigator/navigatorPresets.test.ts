import { describe, expect, it } from "vitest";
import { brushRangeForPreset } from "./navigatorPresets";

describe("brushRangeForPreset", () => {
  it("returns full range for ALL", () => {
    expect(brushRangeForPreset("ALL", ["2026-01-01", "2026-01-02"])).toEqual({
      start: 0,
      end: 100,
    });
  });

  it("computes time-based 1W window from ISO categories", () => {
    const categories = Array.from({ length: 14 }, (_, index) => {
      const date = new Date("2026-01-01T00:00:00Z");
      date.setUTCDate(date.getUTCDate() + index);
      return date.toISOString().slice(0, 10);
    });

    const range = brushRangeForPreset("1W", categories);
    expect(range.start).toBeGreaterThan(40);
    expect(range.end).toBe(100);
  });

  it("falls back to index fractions for non-temporal categories", () => {
    const categories = Array.from({ length: 40 }, (_, index) => `T${index + 1}`);
    const range = brushRangeForPreset("1D", categories);

    expect(range.start).toBeGreaterThan(90);
    expect(range.end).toBe(100);
  });

  it("parses HH:MM intraday categories for time windows", () => {
    const categories = Array.from({ length: 120 }, (_, index) => {
      const totalMinutes = 9 * 60 + 30 + index;
      const hour = Math.floor(totalMinutes / 60);
      const minute = totalMinutes % 60;
      return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    });

    const range = brushRangeForPreset("1D", categories);
    expect(range.start).toBe(0);
    expect(range.end).toBe(100);
  });
});
