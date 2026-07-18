import { describe, expect, it } from "vitest";
import { blockMarksToChartProps } from "./blockMarks";

const ROWS = [
  { week: "W1", revenue: 42, target: 40 },
  { week: "W2", revenue: 48, target: 44 },
  { week: "W3", revenue: 51, target: 48 },
];

describe("blockMarksToChartProps", () => {
  it("maps series, rule, and band marks", () => {
    const result = blockMarksToChartProps(ROWS, [
      { type: "bar", field: "revenue", label: "Revenue" },
      { type: "line", field: "target", label: "Target" },
      { type: "rule", value: 50, label: "Quota", tone: "warning" },
      { type: "band", min: 44, max: 52, label: "Healthy band", tone: "success" },
    ]);

    expect(result.series).toEqual([
      {
        name: "Revenue",
        data: [42, 48, 51],
        kind: "bar",
        tone: undefined,
      },
      {
        name: "Target",
        data: [40, 44, 48],
        kind: "line",
        tone: undefined,
      },
    ]);
    expect(result.referenceLines).toEqual([
      { value: 50, label: "Quota", tone: "warning" },
    ]);
    expect(result.thresholdBands).toEqual([
      { min: 44, max: 52, label: "Healthy band", tone: "success" },
    ]);
    expect(result.fill).toBe(false);
  });

  it("sets fill when an area mark is present", () => {
    const result = blockMarksToChartProps(ROWS, [
      { type: "area", field: "revenue", label: "Revenue" },
    ]);
    expect(result.series[0]?.kind).toBe("line");
    expect(result.fill).toBe(true);
  });
});
