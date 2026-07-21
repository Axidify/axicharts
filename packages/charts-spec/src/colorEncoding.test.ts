import { describe, expect, it } from "vitest";
import {
  applyColorEncodingToBarSeries,
  fillsFromColorField,
  resolveEncodingFill,
} from "./colorEncoding";

describe("colorEncoding", () => {
  it("maps semantic strings to palette colors", () => {
    expect(resolveEncodingFill("success", 0)).toBe("#16a34a");
    expect(resolveEncodingFill("critical", 0)).toBe("#dc2626");
  });

  it("passes through css colors for AI/spec output", () => {
    expect(resolveEncodingFill("hsl(var(--chart-2))", 0)).toBe(
      "hsl(var(--chart-2))",
    );
    expect(resolveEncodingFill("#ff00aa", 0)).toBe("#ff00aa");
  });

  it("builds per-row fills from a data field", () => {
    const rows = [
      { week: "W1", aboveTarget: true },
      { week: "W2", aboveTarget: false },
    ];
    expect(fillsFromColorField(rows, "aboveTarget")).toEqual([
      "#16a34a",
      "#d97706",
    ]);
  });

  it("maps priority labels to nominal semantic colors", () => {
    const rows = [
      { Priority: "Critical", value: 1 },
      { Priority: "High", value: 2 },
      { Priority: "Low", value: 3 },
    ];
    expect(fillsFromColorField(rows, "Priority")).toEqual([
      "#f43f5e",
      "#f59e0b",
      "#64748b",
    ]);
    expect(resolveEncodingFill("P3 – Medium", 0)).toBe("#3b82f6");
  });

  it("applies encoding.color fills to the primary bar series", () => {
    const rows = [
      { priority: "P1 – Critical", count: 12 },
      { priority: "P4 – Low", count: 19 },
    ];
    const series = applyColorEncodingToBarSeries(rows, "priority", [
      { name: "Tickets", kind: "bar", data: [12, 19] },
      { name: "Trend", kind: "line", data: [1, 2] },
    ]);
    expect(series[0]?.fills).toEqual(["#f43f5e", "#64748b"]);
    expect(series[1]?.fills).toBeUndefined();
  });
});
