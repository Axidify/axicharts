import { describe, expect, it } from "vitest";
import { resolveGraphicCoord } from "./resolveGraphicCoords";
import type { GraphicPlotContext } from "./resolveGraphicCoords";

const CTX: GraphicPlotContext = {
  width: 400,
  height: 200,
  insets: { top: 8, right: 14, bottom: 8, left: 14 },
  categories: ["06:00", "08:00", "10:00"],
  yMin: 60,
  yMax: 80,
};

describe("resolveGraphicCoord", () => {
  it("resolves plot-relative fractions", () => {
    const x = resolveGraphicCoord("plot:0.5", "x", CTX);
    const y = resolveGraphicCoord("plot:0.25", "y", CTX);
    expect(x).toBeCloseTo(14 + 0.5 * (400 - 28), 1);
    expect(y).toBeCloseTo(8 + 0.25 * (200 - 16), 1);
  });

  it("resolves category and value conventions", () => {
    const x = resolveGraphicCoord("category:10:00", "x", CTX);
    const y = resolveGraphicCoord("value:70", "y", CTX);
    expect(x).toBeCloseTo(14 + 1 * (400 - 28), 1);
    expect(y).toBeCloseTo(8 + 0.5 * (200 - 16), 1);
  });

  it("resolves percent strings", () => {
    expect(resolveGraphicCoord("50%", "x", CTX)).toBeCloseTo(14 + 0.5 * 372, 1);
  });
});
