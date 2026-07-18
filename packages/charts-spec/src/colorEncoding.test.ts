import { describe, expect, it } from "vitest";
import { fillsFromColorField, resolveEncodingFill } from "./colorEncoding";

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
      "#dc2626",
    ]);
  });
});
