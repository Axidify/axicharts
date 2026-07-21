import { describe, expect, it } from "vitest";
import { cleanTheme } from "@axicharts/charts-theme";
import { STACK_GROUP } from "./stack";
import { buildBarOptions } from "./UPlotBar";

describe("UPlotBar stacked", () => {
  const stackTotalsRef = { current: new Map() };

  it("assigns stack group for multi-series stacked bars", () => {
    const barLayoutsRef = { current: [] as never[] };
    const options = buildBarOptions({
      width: 360,
      height: 220,
      categories: ["S1", "S2", "S3", "S4"],
      series: [
        { name: "Done", data: [22, 26, 24, 28] },
        { name: "Carry-over", data: [6, 4, 5, 3] },
      ],
      theme: cleanTheme,
      stacked: true,
      barLayoutsRef,
      stackTotalsRef,
    });

    expect(options.series?.[1]?.stack).toBe(STACK_GROUP);
    expect(options.series?.[2]?.stack).toBe(STACK_GROUP);
  });

  it("uses tighter y headroom than grouped bars for stacked dashboards", () => {
    const barLayoutsRef = { current: [] as never[] };
    const shared = {
      width: 360,
      height: 220,
      categories: ["S1", "S2", "S3", "S4"],
      series: [
        { name: "Done", data: [22, 26, 24, 28] },
        { name: "Carry-over", data: [6, 4, 5, 3] },
      ],
      theme: cleanTheme,
      barLayoutsRef,
      stackTotalsRef,
    };
    const stackedRange = (
      buildBarOptions({ ...shared, stacked: true }).scales?.y?.range as
        | ((u: unknown, min: number, max: number) => [number, number])
        | undefined
    )?.(null, 0, 31)?.[1];
    const groupedRange = (
      buildBarOptions({ ...shared, stacked: false }).scales?.y?.range as
        | ((u: unknown, min: number, max: number) => [number, number])
        | undefined
    )?.(null, 0, 31)?.[1];

    expect(stackedRange).toBeLessThan(groupedRange ?? Number.POSITIVE_INFINITY);
  });
});

describe("UPlotBar vertical radius", () => {
  const stackTotalsRef = { current: new Map() };

  it("uses custom rounded draw for vertical bars when theme radius is set", () => {
    const barLayoutsRef = { current: [] as never[] };
    const options = buildBarOptions({
      width: 360,
      height: 220,
      categories: ["W1", "W2", "W3", "W4", "W5"],
      series: [{ name: "Throughput", data: [120, 90, 150, 110, 180] }],
      theme: cleanTheme,
      barLayoutsRef,
      stackTotalsRef,
    });

    expect(options.series?.[1]?.fill).toBe("transparent");
    expect(options.series?.[1]?.stroke).toBe("transparent");
  });
});

describe("UPlotBar horizontal", () => {
  const stackTotalsRef = { current: new Map() };

  it("uses horizontal value grid and rounded custom draw path", () => {
    const barLayoutsRef = { current: [] as never[] };
    const options = buildBarOptions({
      width: 360,
      height: 280,
      categories: ["P1 – Critical", "P2 – High", "P3 – Medium", "P4 – Low"],
      series: [
        {
          name: "Tickets",
          data: [12, 28, 45, 19],
          fills: ["#f43f5e", "#f59e0b", "#3b82f6", "#64748b"],
        },
      ],
      theme: cleanTheme,
      orientation: "horizontal",
      barLayoutsRef,
      stackTotalsRef,
    });

    const valueAxis = options.axes?.[1];
    expect(valueAxis?.grid).toEqual(
      expect.objectContaining({ stroke: expect.any(String), width: 1 }),
    );
    expect(options.series?.[1]?.fill).toBe("transparent");
    const rangeFn = options.scales?.y?.range as
      | ((u: unknown, min: number, max: number) => [number, number])
      | undefined;
    expect(rangeFn?.(null, 0, 45)).toEqual([0, 60]);
  });

  it("tightens the category axis gutter", () => {
    const barLayoutsRef = { current: [] as never[] };
    const options = buildBarOptions({
      width: 360,
      height: 280,
      categories: ["P1 – Critical", "P4 – Low"],
      series: [{ name: "Tickets", data: [12, 19] }],
      theme: cleanTheme,
      orientation: "horizontal",
      barLayoutsRef,
      stackTotalsRef,
    });

    const categoryAxis = options.axes?.[0];
    expect(categoryAxis?.size).toBeLessThanOrEqual(92);
    expect(categoryAxis?.gap).toBe(3);
    expect(options.padding?.[3]).toBe(10);

    const valueAxis = options.axes?.[1];
    expect(valueAxis?.incrs).toEqual([15]);
  });
});
