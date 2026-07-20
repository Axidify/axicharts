import { describe, expect, it } from "vitest";
import type { PanelSpec } from "./types";
import {
  cartesianHasColorEncoding,
  cartesianHasSizeEncoding,
  cartesianUsesComposableMarks,
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

  it("emits Cell size for encoding.size on bar panels", () => {
    const spec: PanelSpec = {
      type: "bar",
      encoding: {
        x: { field: "week" },
        y: { field: "throughput" },
        size: { field: "volume", type: "quantitative" },
      },
    };
    expect(cartesianHasSizeEncoding(spec)).toBe(true);
    expect(cartesianUsesComposableMarks(spec)).toBe(true);
    const { body, preamble } = ejectCartesianBody(spec, "rows");
    expect(preamble).toContain("resolveSizeMark");
    expect(preamble).toContain("volumeSizeMinMax");
    expect(body).toContain("size={resolveSizeMark");
    expect(body).toContain("<Cell");
  });

  it("emits Cell fill and size when both encodings are present", () => {
    const { body } = ejectCartesianBody(barSpec, "rows");
    expect(body).toContain("fill={resolveColorFill");
    expect(
      ejectCartesianBody(
        {
          ...barSpec,
          encoding: {
            ...barSpec.encoding!,
            size: { field: "volume" },
          },
        },
        "rows",
      ).body,
    ).toContain("size={resolveSizeMark");
  });

  it("emits line type and curve attr from props.style", () => {
    const { body } = ejectCartesianBody(
      {
        type: "line",
        encoding: {
          x: { field: "week" },
          y: { field: "latency" },
          color: { field: "aboveSlo" },
        },
        props: {
          style: { line: { curve: "linear" } },
        },
      },
      "rows",
    );
    expect(body).toContain('type="linear"');
  });

  it("emits orientation for horizontal bar panels", () => {
    const { body } = ejectCartesianBody(
      {
        type: "bar",
        orientation: "horizontal",
        encoding: {
          x: { field: "department" },
          y: { field: "spend" },
        },
      },
      "rows",
    );
    expect(body).toContain('orientation="horizontal"');
  });
});
