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

  it("sets per-series fill when an area mark is present", () => {
    const result = blockMarksToChartProps(ROWS, [
      { type: "area", field: "revenue", label: "Revenue" },
    ]);
    expect(result.series[0]?.kind).toBe("line");
    expect(result.series[0]?.fill).toBe(true);
    expect(result.fill).toBe(true);
  });

  it("isolates area fill from bars (S08)", () => {
    const result = blockMarksToChartProps(ROWS, [
      { type: "bar", field: "revenue", label: "Revenue" },
      { type: "area", field: "target", label: "Target" },
    ]);
    expect(result.fill).toBe(false);
    expect(result.series[0]?.fill).toBeUndefined();
    expect(result.series[1]?.fill).toBe(true);
  });

  it("preserves per-mark curve (S23)", () => {
    const result = blockMarksToChartProps(ROWS, [
      { type: "line", field: "revenue", curve: "linear" },
      { type: "line", field: "target", curve: "monotone" },
    ]);
    expect(result.series[0]?.curve).toBe("linear");
    expect(result.series[1]?.curve).toBe("monotone");
  });

  it("maps yAxisId right to dualAxis", () => {
    const result = blockMarksToChartProps(ROWS, [
      { type: "bar", field: "revenue", yAxisId: "left" },
      { type: "line", field: "target", yAxisId: "right" },
    ]);
    expect(result.dualAxis).toBe(true);
  });

  it("maps bar labels to showValues", () => {
    const result = blockMarksToChartProps(ROWS, [
      { type: "bar", field: "revenue", labels: true },
    ]);
    expect(result.showValues).toBe(true);
  });

  it("maps shared stack id to stacked", () => {
    const result = blockMarksToChartProps(
      [
        { week: "W1", a: 10, b: 12 },
        { week: "W2", a: 14, b: 9 },
      ],
      [
        { type: "bar", field: "a", stack: "s1" },
        { type: "bar", field: "b", stack: "s1" },
      ],
    );
    expect(result.stacked).toBe(true);
  });
});
