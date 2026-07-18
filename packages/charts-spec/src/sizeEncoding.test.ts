import { describe, expect, it } from "vitest";
import { resolveEncodingSize, sizesFromSizeField } from "./sizeEncoding";

describe("sizeEncoding", () => {
  it("scales quantitative values into bar width fractions", () => {
    const rows = [
      { week: "W1", volume: 10 },
      { week: "W2", volume: 30 },
      { week: "W3", volume: 50 },
    ];
    expect(sizesFromSizeField(rows, "volume", "bar")).toEqual([0.35, 0.675, 1]);
  });

  it("scales quantitative values into point radii", () => {
    const rows = [
      { day: "Mon", score: 0 },
      { day: "Tue", score: 50 },
      { day: "Wed", score: 100 },
    ];
    expect(sizesFromSizeField(rows, "score", "point")).toEqual([3, 6.5, 10]);
  });

  it("scales quantitative values into bubble radii", () => {
    const rows = [
      { symbol: "AAPL", marketCap: 10 },
      { symbol: "MSFT", marketCap: 30 },
      { symbol: "NVDA", marketCap: 50 },
    ];
    expect(sizesFromSizeField(rows, "marketCap", "bubble")).toEqual([6, 17, 28]);
  });

  it("honors custom output range", () => {
    expect(resolveEncodingSize(50, 0, 100, "point", [4, 8])).toBe(6);
    expect(resolveEncodingSize(50, 0, 100, "bubble", [8, 20])).toBe(14);
  });
});
