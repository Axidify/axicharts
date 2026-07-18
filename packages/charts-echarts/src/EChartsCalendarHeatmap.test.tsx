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

import { EChartsCalendarHeatmap } from "./EChartsCalendarHeatmap";

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
