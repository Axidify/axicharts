import { describe, expect, it } from "vitest";
import { matrixFromRows } from "./heatmapEncoding";

describe("matrixFromRows", () => {
  it("builds a heatmap matrix from long-form rows", () => {
    const rows = [
      { x: "Mon", y: "API", value: 0.8 },
      { x: "Tue", y: "API", value: 0.6 },
      { x: "Mon", y: "DB", value: 0.4 },
      { x: "Tue", y: "DB", value: 0.9 },
    ];

    expect(matrixFromRows(rows, "x", "y", "value")).toEqual({
      xCategories: ["Mon", "Tue"],
      yCategories: ["API", "DB"],
      values: [
        [0.8, 0.6],
        [0.4, 0.9],
      ],
    });
  });
});
