import { describe, expect, it } from "vitest";
import type uPlot from "uplot";
import { cleanTheme } from "@axicharts/charts-theme";
import { buildBarOptions } from "./UPlotBar";
import { buildComboOptions } from "./UPlotCombo";
import { buildLineOptions } from "./UPlotLine";

const base = {
  width: 480,
  height: 240,
  categories: ["Mon", "Tue", "Wed", "Thu"],
  series: [{ name: "Revenue", data: [1200, 1800, 1500, 2100] }],
  theme: cleanTheme,
};
const refs = () => ({ barLayoutsRef: { current: [] as never[] }, stackTotalsRef: { current: new Map() } });

type AxisValues = (u: uPlot, splits: number[]) => string[];
type AxisSplits = (u: uPlot, axisIdx: number, min: number, max: number) => number[];
type ScaleRange = (u: uPlot, min: number, max: number) => [number, number];
const u = {} as uPlot;

const builders = {
  line: (extra: object) => buildLineOptions({ ...base, ...extra }),
  bar: (extra: object) => buildBarOptions({ ...base, ...refs(), ...extra }),
  combo: (extra: object) =>
    buildComboOptions({
      ...base,
      series: [{ name: "Revenue", data: [1200, 1800, 1500, 2100], kind: "bar" as const }],
      ...refs(),
      ...extra,
    }),
};

describe.each(Object.entries(builders))("%s value axis options", (_name, build) => {
  it("formats value-axis ticks with valueFormat", () => {
    const axis = build({ valueFormat: "compact" }).axes?.[1];
    expect((axis?.values as AxisValues)(u, [0, 1500, 2000000])).toEqual(["0", "1.5K", "2M"]);
    expect(typeof axis?.size).toBe("function");
  });

  it("accepts a formatter function", () => {
    const axis = build({ valueFormat: (value: number) => `$${value / 1000}k` }).axes?.[1];
    expect((axis?.values as AxisValues)(u, [1000, 2500])).toEqual(["$1k", "$2.5k"]);
  });

  it("clamps the y scale with yDomain, keeping auto sides", () => {
    const range = build({ yDomain: [0, 3000] }).scales?.y?.range as ScaleRange;
    expect(range(u, 1200, 2100)).toEqual([0, 3000]);
    const autoTop = build({ yDomain: [0, "auto"] }).scales?.y?.range as ScaleRange;
    const [min, max] = autoTop(u, 1200, 2100);
    expect(min).toBe(0);
    expect(max).toBeGreaterThanOrEqual(2100);
  });

  it("uses yTickCount for value-axis splits", () => {
    const splits = build({ yTickCount: 5 }).axes?.[1]?.splits as AxisSplits;
    expect(splits(u, 1, 0, 2000)).toEqual([0, 500, 1000, 1500, 2000]);
  });

  it("leaves default options untouched", () => {
    const axis = build({}).axes?.[1];
    expect(axis?.values).toBeUndefined();
    expect(axis?.size).toBe(32);
  });
});

describe("compact tiles", () => {
  it("keep their own splits and fixed size", () => {
    const axis = buildLineOptions({ ...base, height: 60, valueFormat: "compact", yTickCount: 6 }).axes?.[1];
    expect(axis?.size).toBe(0);
    expect(typeof axis?.splits).toBe("function");
    expect((axis?.splits as AxisSplits)(u, 1, 0, 100)).not.toHaveLength(6);
  });
});
