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
  series: [
    {
      type: "bar",
      data: [12, 20, 15, 8],
    },
  ],
  xAxis: {
    type: "category",
    data: ["Mon", "Tue", "Wed", "Thu"],
  },
  yAxis: { type: "value" },
};

describe("EChartsOptionChart", () => {
  it("passes the option through to useEChart", () => {
    useEChartCalls.length = 0;

    render(
      <EChartsOptionChart
        width={320}
        height={240}
        theme={cleanTheme}
        option={SAMPLE_OPTION}
      />,
    );

    const call = useEChartCalls.at(-1);
    expect(call?.option).toMatchObject({
      series: [{ type: "bar", data: [12, 20, 15, 8] }],
    });
    expect(call?.width).toBe(320);
    expect(call?.height).toBe(240);
  });

  it("passes mergeOption in live mode", () => {
    useEChartCalls.length = 0;

    render(
      <EChartsOptionChart
        width={320}
        height={240}
        theme={cleanTheme}
        option={SAMPLE_OPTION}
        mergeOption
      />,
    );

    const call = useEChartCalls.at(-1);
    expect(call?.mergeOption).toBe(true);
    expect((call?.option as { animation?: boolean }).animation).toBe(false);
  });

  it("keeps explicit animation when option already animates", () => {
    useEChartCalls.length = 0;

    render(
      <EChartsOptionChart
        width={320}
        height={240}
        theme={cleanTheme}
        option={{ ...SAMPLE_OPTION, animation: true, animationDuration: 1200 }}
        animate={false}
      />,
    );

    const call = useEChartCalls.at(-1);
    expect((call?.option as { animation?: boolean }).animation).toBe(true);
    expect((call?.option as { animationDuration?: number }).animationDuration).toBe(
      1200,
    );
  });

  it("forwards categories for sync", () => {
    useEChartCalls.length = 0;

    render(
      <EChartsOptionChart
        width={320}
        height={240}
        theme={cleanTheme}
        option={SAMPLE_OPTION}
        categories={["Mon", "Tue", "Wed", "Thu"]}
      />,
    );

    const call = useEChartCalls.at(-1);
    expect(call?.categories).toEqual(["Mon", "Tue", "Wed", "Thu"]);
  });
});
