import { describe, expect, it } from "vitest";
import { executeTransform, listTransformOps } from "./executeTransform";

const ROWS = [
  { status: "Open", hours: 2 },
  { status: "Open", hours: 3 },
  { status: "Closed", hours: 5 },
];

describe("executeTransform", () => {
  it("lists closed transform ops", () => {
    const catalog = listTransformOps();
    expect(catalog.aggregateOps).toEqual(["sum", "last", "count"]);
    expect(catalog.whereOps).toContain("eq");
  });

  it("aggregates rows by dimension", () => {
    const result = executeTransform(ROWS, {
      groupBy: "status",
      aggregates: { count: { op: "count" }, hours: { op: "sum", field: "hours" } },
    });
    expect(result).toEqual([
      { status: "Open", count: 2, hours: 5 },
      { status: "Closed", count: 1, hours: 5 },
    ]);
  });
});
