import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { composeCartesianMarks } from "./composeCartesian";
import { Bar, Line, XAxis, YAxis } from "./marks";

const DATA = [
  { date: "Mon", revenue: 120, margin: 42 },
  { date: "Tue", revenue: 132, margin: 48 },
  { date: "Wed", revenue: 101, margin: 39 },
];

describe("composeCartesianMarks", () => {
  it("builds categories and series from composable children", () => {
    const composed = composeCartesianMarks(
      [
        createElement(XAxis, { dataKey: "date" }),
        createElement(YAxis, { tickFormat: "currency" }),
        createElement(Line, { dataKey: "revenue" }),
        createElement(Line, { dataKey: "margin", tone: "warning" }),
      ],
      DATA,
      {
        revenue: { label: "Revenue" },
      },
      ["line", "area"],
    );

    expect(composed.categories).toEqual(["Mon", "Tue", "Wed"]);
    expect(composed.series).toHaveLength(2);
    expect(composed.series[0]).toMatchObject({
      name: "Revenue",
      data: [120, 132, 101],
    });
    expect(composed.series[1]?.tone).toBe("warning");
    expect(composed.valueSuffix).toBe(" USD");
  });

  it("collects only bar marks for bar charts", () => {
    const composed = composeCartesianMarks(
      [
        createElement(XAxis, { dataKey: "date" }),
        createElement(Bar, { dataKey: "revenue" }),
        createElement(Line, { dataKey: "margin" }),
      ],
      DATA,
      undefined,
      ["bar"],
    );

    expect(composed.series).toHaveLength(1);
    expect(composed.series[0]?.name).toBe("revenue");
  });
});
