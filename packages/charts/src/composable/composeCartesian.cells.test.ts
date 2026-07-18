import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { composeCartesianMarks } from "./composeCartesian";
import { Area, Bar, Cell, Line, XAxis } from "./marks";

const DATA = [
  { week: "W1", throughput: 120 },
  { week: "W2", throughput: 90 },
  { week: "W3", throughput: 150 },
  { week: "W4", throughput: 110 },
  { week: "W5", throughput: 180 },
];

describe("composeCartesianMarks bar cells", () => {
  it("applies per-category fills from Cell children", () => {
    const composed = composeCartesianMarks(
      [
        createElement(XAxis, { dataKey: "week" }),
        createElement(
          Bar,
          { dataKey: "throughput" },
          createElement(Cell, { dataKey: "W3", fill: "#16a34a" }),
          createElement(Cell, { dataKey: "W5", tone: "warning" }),
        ),
      ],
      DATA,
      undefined,
      ["bar"],
    );

    expect(composed.series[0]?.fills).toEqual([
      "#2563eb",
      "#2563eb",
      "#16a34a",
      "#2563eb",
      "#d97706",
    ]);
  });

  it("applies per-category fills from Cell children on line marks", () => {
    const composed = composeCartesianMarks(
      [
        createElement(XAxis, { dataKey: "week" }),
        createElement(
          Line,
          { dataKey: "throughput" },
          createElement(Cell, { dataKey: "W2", tone: "critical" }),
          createElement(Cell, { dataKey: "W4", fill: "#7c3aed" }),
        ),
      ],
      DATA,
      undefined,
      ["line"],
    );

    expect(composed.series[0]?.fills).toEqual([
      "#2563eb",
      "#dc2626",
      "#2563eb",
      "#7c3aed",
      "#2563eb",
    ]);
  });

  it("applies per-category fills from Cell children on area marks", () => {
    const composed = composeCartesianMarks(
      [
        createElement(XAxis, { dataKey: "week" }),
        createElement(
          Area,
          { dataKey: "throughput" },
          createElement(Cell, { dataKey: "W1", tone: "success" }),
        ),
      ],
      DATA,
      undefined,
      ["area"],
    );

    expect(composed.series[0]?.fills?.[0]).toBe("#16a34a");
  });
});
