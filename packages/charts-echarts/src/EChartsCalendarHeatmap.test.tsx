import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { cleanTheme, liveTheme, type ChartTheme } from "@axicharts/charts-theme";

const useEChartCalls: Array<Record<string, unknown>> = [];

vi.mock("./useEChart", () => ({
  useEChart: (options: Record<string, unknown>) => {
    useEChartCalls.push(options);
    return { current: null };
  },
}));

import { EChartsCalendarHeatmap } from "./EChartsCalendarHeatmap";
import { renderOptionToSvg, svgTexts } from "./testing/renderOptionToSvg";

describe("EChartsCalendarHeatmap", () => {
  it("builds calendar + heatmap option shape", () => {
    useEChartCalls.length = 0;

    render(
      <EChartsCalendarHeatmap
        width={640}
        height={220}
        theme={cleanTheme}
        data={{
          points: [
            { date: "2026-01-01", value: 2 },
            { date: "2026-01-02", value: 5 },
          ],
          year: 2026,
        }}
      />,
    );

    const call = useEChartCalls.at(-1);
    const option = call?.option as {
      calendar?: { range?: string };
      series?: Array<{ type?: string; coordinateSystem?: string; data?: unknown[] }>;
      visualMap?: { min?: number; max?: number };
    };

    expect(option.calendar?.range).toBe("2026");
    expect(option.series?.[0]).toMatchObject({
      type: "heatmap",
      coordinateSystem: "calendar",
      data: [
        ["2026-01-01", 2],
        ["2026-01-02", 5],
      ],
    });
    expect(option.visualMap).toMatchObject({ min: 2, max: 5 });
  });

  it("passes mergeOption in live mode", () => {
    useEChartCalls.length = 0;

    render(
      <EChartsCalendarHeatmap
        width={320}
        height={200}
        theme={cleanTheme}
        data={{ points: [{ date: "2026-07-18", value: 9 }], year: 2026 }}
        mergeOption
      />,
    );

    expect(useEChartCalls.at(-1)?.mergeOption).toBe(true);
  });
});

const yearPoints = Array.from({ length: 120 }, (_, index) => ({
  date: new Date(Date.UTC(2026, 0, 1 + index * 3)).toISOString().slice(0, 10),
  value: (index * 7) % 20,
}));

function calendarSvg(width: number, height: number, theme: ChartTheme = cleanTheme) {
  useEChartCalls.length = 0;
  render(
    <EChartsCalendarHeatmap
      width={width}
      height={height}
      theme={theme}
      data={{ points: yearPoints, year: 2026 }}
    />,
  );
  const option = useEChartCalls.at(-1)?.option as Record<string, unknown> & {
    calendar: { itemStyle: { borderColor: string } };
  };
  return { option, svg: renderOptionToSvg(option, { width, height }) };
}

const monthNames = (svg: string) =>
  svgTexts(svg).filter((text) =>
    ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].includes(text),
  );

describe("EChartsCalendarHeatmap chrome", () => {
  it("shows quarter-start month labels in compact tiles", () => {
    expect(monthNames(calendarSvg(240, 120).svg)).toEqual(["Jan", "Apr", "Jul", "Oct"]);
  });

  it("keeps every month at full size", () => {
    expect(monthNames(calendarSvg(720, 220).svg)).toHaveLength(12);
  });

  it("draws month dividers in grid chrome, not ECharts' default black", () => {
    const { svg } = calendarSvg(720, 220);
    expect(svg).not.toMatch(/stroke="(#000|#000000|rgb\(0,\s*0,\s*0\))"/);
  });

  it("matches cell gutters to the theme surface", () => {
    expect(calendarSvg(720, 220, cleanTheme).option.calendar.itemStyle.borderColor).toBe("#ffffff");
    expect(calendarSvg(720, 220, liveTheme).option.calendar.itemStyle.borderColor).toBe("#0f172a");
  });
});
