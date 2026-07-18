import { describe, expect, it } from "vitest";
import type { EChartsOption } from "echarts";
import { mergeGraphicsIntoOption } from "./mergeGraphicsIntoOption";

describe("mergeGraphicsIntoOption", () => {
  it("appends graphics without clobbering existing option.graphic", () => {
    const base: EChartsOption = {
      graphic: [{ type: "text", style: { text: "A" } }],
      series: [{ type: "line", data: [1, 2] }],
    };
    const merged = mergeGraphicsIntoOption(base, [
      { type: "circle", shape: { r: 6 } },
    ]);
    const graphic = merged.graphic;
    expect(Array.isArray(graphic)).toBe(true);
    expect(graphic).toHaveLength(2);
  });

  it("returns the same option when graphics are empty", () => {
    const base: EChartsOption = { series: [{ type: "bar", data: [1] }] };
    expect(mergeGraphicsIntoOption(base, [])).toBe(base);
    expect(mergeGraphicsIntoOption(base)).toBe(base);
  });
});
