import { describe, expect, it, beforeEach } from "vitest";
import { isValidElement } from "react";
import { clearCategoryRegistration } from "../panelCategories";

describe("category-scoped spec entrypoints", () => {
  beforeEach(() => {
    clearCategoryRegistration();
  });

  it(
    "cartesian entry compiles line panels and rejects matrix panels",
    async () => {
    const { compilePanel } = await import("./cartesian");

    const panel = compilePanel(
      {
        type: "line",
        props: {
          categories: ["Mon", "Tue"],
          series: [{ name: "A", data: [1, 2] }],
        },
      },
      {},
    );

    expect(isValidElement(panel)).toBe(true);

    expect(() =>
      compilePanel(
        {
          type: "heatmap",
          props: {
            matrix: {
              xLabels: ["A"],
              yLabels: ["B"],
              values: [[1]],
            },
          },
        },
        {},
      ),
    ).toThrow(/requires category "matrix"/);
  },
    15_000,
  );

  it("distribution entry compiles pie panels", async () => {
    const { compilePanel } = await import("./distribution");

    const panel = compilePanel(
      {
        type: "pie",
        props: {
          slices: [
            { name: "A", value: 1 },
            { name: "B", value: 2 },
          ],
        },
      },
      {},
    );

    expect(isValidElement(panel)).toBe(true);
  });
});
