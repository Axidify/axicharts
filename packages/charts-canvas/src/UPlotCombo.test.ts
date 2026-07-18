import { describe, expect, it } from "vitest";
import { cleanTheme } from "@axicharts/charts-theme";
import { buildComboOptions } from "./UPlotCombo";

describe("UPlotCombo", () => {
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
    });

    const barSeries = options.series?.[1];
    const lineSeries = options.series?.[2];
    expect(typeof barSeries?.paths).toBe("function");
    expect(typeof lineSeries?.paths).toBe("function");
    expect(barSeries?.paths).not.toBe(lineSeries?.paths);
    expect(lineSeries?.width).toBeGreaterThan(0);
    expect(barSeries?.width).toBe(0);
  });
});
