import { describe, expect, it } from "vitest";
import { seriesDataSignature, seriesStructureSignature } from "./resolve";

const CATEGORIES = ["Q1", "Q2", "Q3"];

function item(name: string, data: number[]): { name: string; data: number[] } {
  return { name, data };
}
const SERIES = [
  item("Revenue", [100, 200, 150]),
  item("Cost", [80, 120, 90]),
];

describe("seriesStructureSignature", () => {
  it("is stable when only values change", () => {
    const base = seriesStructureSignature(CATEGORIES, SERIES);
    const valueOnly = seriesStructureSignature(CATEGORIES, [
      item("Revenue", [110, 210, 160]),
      item("Cost", [85, 125, 95]),
    ]);
    expect(valueOnly).toBe(base);
  });

  it("changes when category labels change", () => {
    const base = seriesStructureSignature(CATEGORIES, SERIES);
    const relabeled = seriesStructureSignature(
      ["Q1", "Q2", "Q4"],
      SERIES,
    );
    expect(relabeled).not.toBe(base);
  });

  it("changes when category count changes", () => {
    const base = seriesStructureSignature(CATEGORIES, SERIES);
    const fewer = seriesStructureSignature(["Q1", "Q2"], SERIES);
    expect(fewer).not.toBe(base);
  });

  it("changes when series count changes", () => {
    const base = seriesStructureSignature(CATEGORIES, SERIES);
    const single = seriesStructureSignature(CATEGORIES, [SERIES[0]!]);
    expect(single).not.toBe(base);
  });

  it("changes when series names change", () => {
    const base = seriesStructureSignature(CATEGORIES, SERIES);
    const renamed = seriesStructureSignature(CATEGORIES, [
      item("Revenue", SERIES[0]!.data),
      item("Opex", SERIES[1]!.data),
    ]);
    expect(renamed).not.toBe(base);
  });

  it("differs from seriesDataSignature on value-only updates", () => {
    const structure = seriesStructureSignature(CATEGORIES, SERIES);
    const dataSigA = seriesDataSignature(CATEGORIES, SERIES);
    const dataSigB = seriesDataSignature(CATEGORIES, [
      item("Revenue", [999, 888, 777]),
      item("Cost", [111, 222, 333]),
    ]);
    expect(dataSigA).not.toBe(dataSigB);
    expect(seriesStructureSignature(CATEGORIES, [
      item("Revenue", [999, 888, 777]),
      item("Cost", [111, 222, 333]),
    ])).toBe(structure);
  });
});
