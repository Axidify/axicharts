import { describe, expect, it } from "vitest";
import { cleanTheme } from "@axicharts/charts-theme";
import { buildComboOptions } from "./UPlotCombo";

describe("UPlotCombo", () => {
  const stackTotalsRef = { current: new Map() };

  it("assigns bar paths to bar series and line paths to line series", () => {
    const barLayoutsRef = { current: [] as never[] };
    const options = buildComboOptions({
      width: 320,
      height: 200,
      categories: ["W1", "W2"],
      series: [
        { name: "Volume", kind: "bar", data: [120, 90] },
        { name: "Trend", kind: "line", data: [12, 9] },
      ],
      theme: cleanTheme,
      barLayoutsRef,
      stackTotalsRef,
    });

    const barSeries = options.series?.[1];
    const lineSeries = options.series?.[2];
    expect(typeof barSeries?.paths).toBe("function");
    expect(typeof lineSeries?.paths).toBe("function");
    expect(barSeries?.paths).not.toBe(lineSeries?.paths);
    expect(lineSeries?.width).toBeGreaterThan(0);
    expect(barSeries?.width).toBe(0);
  });

  it("assigns secondary series to y2 when dual axis is enabled", () => {
    const barLayoutsRef = { current: [] as never[] };
    const options = buildComboOptions({
      width: 320,
      height: 200,
      categories: ["W1", "W2"],
      series: [
        { name: "Volume", kind: "bar", data: [120, 90] },
        { name: "Trend", kind: "line", data: [12, 9] },
      ],
      theme: cleanTheme,
      dualAxis: true,
      barLayoutsRef,
      stackTotalsRef,
    });

    expect(options.scales?.y2).toBeDefined();
    expect(options.series?.[1]?.scale).toBe("y");
    expect(options.series?.[2]?.scale).toBe("y2");
    expect(options.axes?.length).toBe(3);
  });

  it("stacks bar series when stacked is enabled", () => {
    const barLayoutsRef = { current: [] as never[] };
    const options = buildComboOptions({
      width: 320,
      height: 200,
      categories: ["W1", "W2"],
      series: [
        { name: "A", kind: "bar", data: [40, 30] },
        { name: "B", kind: "bar", data: [20, 50] },
        { name: "Trend", kind: "line", data: [12, 9] },
      ],
      theme: cleanTheme,
      stacked: true,
      barLayoutsRef,
      stackTotalsRef,
    });

    expect(options.series?.[1]?.stack).toBeDefined();
    expect(options.series?.[2]?.stack).toBeDefined();
    expect(options.series?.[3]?.stack).toBeUndefined();
    expect(options.scales?.y2).toBeUndefined();
  });

  it("uses compact padding when height is below 72px", () => {
    const barLayoutsRef = { current: [] as never[] };
    const options = buildComboOptions({
      width: 200,
      height: 60,
      categories: ["A", "B"],
      series: [{ name: "count", kind: "bar", data: [3, 1] }],
      theme: cleanTheme,
      barLayoutsRef,
      stackTotalsRef,
    });

    expect(options.padding).toEqual([4, 6, 4, 6]);
    expect(options.axes?.[0]?.size).toBe(0);
  });

  it("reserves top padding when showValues is enabled", () => {
    const barLayoutsRef = { current: [] as never[] };
    const options = buildComboOptions({
      width: 320,
      height: 200,
      categories: ["Online", "Warning"],
      series: [{ name: "count", kind: "bar", data: [3, 1] }],
      theme: cleanTheme,
      showValues: true,
      barLayoutsRef,
      stackTotalsRef,
    });

    expect(options.padding?.[0]).toBeGreaterThanOrEqual(18);
  });

  it("uses padded ordinal x scale for categorical charts", () => {
    const barLayoutsRef = { current: [] as never[] };
    const options = buildComboOptions({
      width: 320,
      height: 200,
      categories: ["Online", "Warning"],
      series: [{ name: "count", kind: "bar", data: [3, 1] }],
      theme: cleanTheme,
      barLayoutsRef,
      stackTotalsRef,
    });

    expect(options.scales?.x?.range?.(null as never, 0, 1)).toEqual([-0.5, 1.5]);
    expect(options.padding?.[3]).toBeGreaterThanOrEqual(14);
  });
});
