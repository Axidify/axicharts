import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { composeComboCartesianMarks } from "./composeComboCartesian";
import { Bar, Line, Area, XAxis } from "./marks";

const DATA = [
  { week: "W1", revenue: 42, target: 40 },
  { week: "W2", revenue: 48, target: 44 },
];

describe("composeComboCartesianMarks", () => {
  it("composes bar, line, and area marks with kinds", () => {
    const composed = composeComboCartesianMarks(
      [
        createElement(XAxis, { dataKey: "week" }),
        createElement(Bar, { dataKey: "revenue", name: "Revenue" }),
        createElement(Area, { dataKey: "target", name: "Target" }),
      ],
      DATA,
      undefined,
    );

    expect(composed.categories).toEqual(["W1", "W2"]);
    expect(composed.series).toHaveLength(2);
    expect(composed.series[0]).toMatchObject({ kind: "bar", name: "Revenue" });
    expect(composed.series[1]).toMatchObject({
      kind: "line",
      name: "Target",
      fill: true,
    });
  });

  it("preserves per-mark curve", () => {
    const composed = composeComboCartesianMarks(
      [
        createElement(XAxis, { dataKey: "week" }),
        createElement(Line, { dataKey: "revenue", type: "linear" }),
        createElement(Line, { dataKey: "target", type: "monotone" }),
      ],
      DATA,
      undefined,
    );

    expect(composed.series[0]?.curve).toBe("linear");
    expect(composed.series[1]?.curve).toBe("monotone");
  });
});
