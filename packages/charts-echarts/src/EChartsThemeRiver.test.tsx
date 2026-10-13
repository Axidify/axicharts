import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { cleanTheme } from "@axicharts/charts-theme";

const useEChartCalls: Array<Record<string, unknown>> = [];

vi.mock("./useEChart", () => ({
  useEChart: (options: Record<string, unknown>) => {
    useEChartCalls.push(options);
    return { current: null };
  },
}));

import { EChartsThemeRiver } from "./EChartsThemeRiver";
import { countFilledShapes, renderOptionToSvg, svgTexts } from "./testing/renderOptionToSvg";

const points = ["01", "08", "15", "22"].flatMap((day, index) => [
  { time: `2026-01-${day}`, value: 42 + index * 6, series: "API" },
  { time: `2026-01-${day}`, value: 28 + index * 4, series: "Workers" },
  { time: `2026-01-${day}`, value: 18 + index * 2, series: "Batch" },
]);

function optionFor(width: number, height: number) {
  useEChartCalls.length = 0;
  render(<EChartsThemeRiver width={width} height={height} theme={cleanTheme} points={points} />);
  return useEChartCalls.at(-1)?.option as Record<string, unknown> & {
    singleAxis: { top: number; bottom: number };
  };
}

describe("EChartsThemeRiver", () => {
  it("draws one stream per series", () => {
    const svg = renderOptionToSvg(optionFor(640, 240), { width: 640, height: 240 });
    expect(countFilledShapes(svg)).toBeGreaterThanOrEqual(3);
  });

  it("labels day ticks with the month, not bare day numbers", () => {
    const svg = renderOptionToSvg(optionFor(640, 240), { width: 640, height: 240 });
    const dayTicks = svgTexts(svg).filter((text) => /\d/.test(text) && text !== "2026");
    expect(dayTicks.length).toBeGreaterThan(0);
    expect(dayTicks.every((text) => /^Jan \d+$/.test(text))).toBe(true);
  });

  it("tightens gutters in compact tiles so streams keep their height", () => {
    const full = optionFor(640, 240).singleAxis;
    const compact = optionFor(240, 120).singleAxis;
    expect(compact.top + compact.bottom).toBeLessThan(full.top + full.bottom);
    expect(120 - compact.top - compact.bottom).toBeGreaterThanOrEqual(80);
  });
});
