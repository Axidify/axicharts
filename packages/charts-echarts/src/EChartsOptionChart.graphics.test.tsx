import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { cleanTheme } from "@axicharts/charts-theme";
import type { EChartsOption } from "echarts";

const useEChartCalls: Array<Record<string, unknown>> = [];

vi.mock("./useEChart", () => ({
  useEChart: (options: Record<string, unknown>) => {
    useEChartCalls.push(options);
    return { current: null };
  },
}));

import { EChartsOptionChart } from "./EChartsOptionChart";

const SAMPLE_OPTION: EChartsOption = {
  series: [{ type: "scatter", data: [[1, 2], [3, 4]] }],
  xAxis: { type: "value" },
  yAxis: { type: "value" },
};

describe("EChartsOptionChart graphics", () => {
  it("merges graphics into the option passed to useEChart", () => {
    useEChartCalls.length = 0;

    render(
      <EChartsOptionChart
        width={320}
        height={240}
        theme={cleanTheme}
        option={SAMPLE_OPTION}
        graphics={[
          {
            type: "circle",
            left: "50%",
            top: "40%",
            shape: { r: 20 },
            style: { fill: "#fbbf24", opacity: 0.4 },
          },
        ]}
      />,
    );

    const call = useEChartCalls.at(-1);
    expect(call?.graphics).toHaveLength(1);
    expect((call?.graphics as { type: string }[])[0]?.type).toBe("circle");
  });
});
