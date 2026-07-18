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

import { EChartsPictorialBar } from "./EChartsPictorialBar";

describe("EChartsPictorialBar", () => {
  it("builds pictorialBar option shape", () => {
    useEChartCalls.length = 0;

    render(
      <EChartsPictorialBar
        width={640}
        height={260}
        theme={cleanTheme}
        data={{
          items: [
            { category: "CPU", value: 72 },
            { category: "Memory", value: 58 },
          ],
          symbol: "roundRect",
        }}
      />,
    );

    const call = useEChartCalls.at(-1);
    const option = call?.option as {
      xAxis?: { data?: string[] };
      series?: Array<{
        type?: string;
        symbolRepeat?: boolean;
        symbolClip?: boolean;
        data?: Array<{ value?: number; symbol?: string }>;
      }>;
    };

    expect(option.xAxis?.data).toEqual(["CPU", "Memory"]);
    expect(option.series?.[0]).toMatchObject({
      type: "pictorialBar",
      symbolRepeat: true,
      symbolClip: true,
    });
    expect(option.series?.[0]?.data).toEqual([
      { value: 72, symbol: "roundRect", itemStyle: expect.any(Object) },
      { value: 58, symbol: "roundRect", itemStyle: expect.any(Object) },
    ]);
  });

  it("passes mergeOption in live mode", () => {
    useEChartCalls.length = 0;

    render(
      <EChartsPictorialBar
        width={320}
        height={200}
        theme={cleanTheme}
        data={{ items: [{ category: "Storage", value: 41 }] }}
        mergeOption
      />,
    );

    expect(useEChartCalls.at(-1)?.mergeOption).toBe(true);
  });
});
