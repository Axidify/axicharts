import { describe, expect, it } from "vitest";
import type { PanelSpec } from "./types";
import {
  cartesianHasColorEncoding,
  ejectCartesianBody,
  ejectCartesianImports,
} from "./ejectCartesian";

describe("ejectCartesian", () => {
  const barSpec: PanelSpec = {
    type: "bar",
    encoding: {
      x: { field: "week" },
      y: { field: "throughput" },
      color: { field: "aboveTarget", type: "semantic" },
    },
    props: { showValues: true },
  };

  it("detects color encoding on cartesian panels", () => {
    expect(cartesianHasColorEncoding(barSpec)).toBe(true);
    expect(cartesianHasColorEncoding({ type: "line", encoding: { x: { field: "t" } } })).toBe(
      false,
    );
  });

  it("emits composable Cell children for encoding.color", () => {
    const { body, preamble } = ejectCartesianBody(barSpec, "rows");
    expect(preamble).toContain("resolveColorFill");
    expect(body).toContain('data={rows}');
    expect(body).toContain("<Bar dataKey=\"throughput\">");
    expect(body).toContain("resolveColorFill(row.aboveTarget)");
    expect(body).toContain("<Cell");
  });

  it("adds composable mark imports when color is present", () => {
    expect(ejectCartesianImports(barSpec)).toEqual([
      "BarChart",
      "Bar",
      "Cell",
      "XAxis",
      "YAxis",
    ]);
  });
});
