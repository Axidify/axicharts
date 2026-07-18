import { describe, expect, it } from "vitest";
import { bumpFromRows } from "./bumpEncoding";

describe("bumpFromRows", () => {
  it("pivots long-form rows into wide bump data", () => {
    const result = bumpFromRows(
      [
        { period: "2018", entity: "USA", rank: 1 },
        { period: "2019", entity: "USA", rank: 2 },
        { period: "2018", entity: "China", rank: 2 },
        { period: "2019", entity: "China", rank: 1 },
      ],
      {},
      {
        x: { field: "period" },
        y: { field: "rank" },
        series: { field: "entity" },
      },
    );

    expect(result.categories).toEqual(["2018", "2019"]);
    expect(result.series).toEqual([
      { name: "USA", ranks: [1, 2] },
      { name: "China", ranks: [2, 1] },
    ]);
  });

  it("accepts wide categories + series props", () => {
    const wide = {
      categories: ["2018", "2019"],
      series: [{ name: "USA", ranks: [1, 2] }],
    };

    expect(bumpFromRows([], wide)).toEqual(wide);
  });
});
