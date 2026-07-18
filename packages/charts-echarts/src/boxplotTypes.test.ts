import { describe, expect, it } from "vitest";
import { boxplotCategories, boxplotTuple } from "./boxplotTypes";

describe("boxplotTypes", () => {
  it("maps boxplot items to echarts tuples", () => {
    expect(
      boxplotTuple({
        category: "A",
        min: 1,
        q1: 2,
        median: 3,
        q3: 4,
        max: 5,
      }),
    ).toEqual([1, 2, 3, 4, 5]);
  });

  it("reads categories from a single series list", () => {
    expect(
      boxplotCategories([
        { category: "A", min: 1, q1: 2, median: 3, q3: 4, max: 5 },
        { category: "B", min: 2, q1: 3, median: 4, q3: 5, max: 6 },
      ]),
    ).toEqual(["A", "B"]);
  });
});
