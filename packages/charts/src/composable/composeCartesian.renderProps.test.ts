import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { composeCartesianMarks } from "./composeCartesian";
import { Area, Bar, Line, XAxis } from "./marks";

const DATA = [
  { date: "Mon", revenue: 120, margin: 42 },
  { date: "Tue", revenue: 132, margin: 48 },
  { date: "Wed", revenue: 101, margin: 39 },
];

describe("composeCartesianMarks render props", () => {
  it("threads renderPath from line and area marks", () => {
    const renderLine = vi.fn();
    const renderArea = vi.fn();

    const composed = composeCartesianMarks(
      [
        createElement(XAxis, { dataKey: "date" }),
        createElement(Line, { dataKey: "revenue", renderPath: renderLine }),
        createElement(Area, { dataKey: "margin", renderPath: renderArea }),
      ],
      DATA,
      undefined,
      ["line", "area"],
    );

    expect(composed.series[0]?.renderPath).toBe(renderLine);
    expect(composed.series[1]?.renderPath).toBe(renderArea);
    expect(composed.series[0]?.renderBar).toBeUndefined();
  });

  it("threads renderBar from bar marks", () => {
    const renderBar = vi.fn();

    const composed = composeCartesianMarks(
      [
        createElement(XAxis, { dataKey: "date" }),
        createElement(Bar, { dataKey: "revenue", renderBar }),
      ],
      DATA,
      undefined,
      ["bar"],
    );

    expect(composed.series[0]?.renderBar).toBe(renderBar);
    expect(composed.series[0]?.renderPath).toBeUndefined();
  });
});
