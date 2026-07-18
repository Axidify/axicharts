import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { cleanTheme } from "@axicharts/charts-theme";
import type { ReactElement } from "react";

const useEChartCalls: Array<Record<string, unknown>> = [];

vi.mock("./useEChart", () => ({
  useEChart: (options: Record<string, unknown>) => {
    useEChartCalls.push(options);
    return { current: null };
  },
}));

import { EChartsBump } from "./EChartsBump";

const sampleData = {
  categories: ["2018", "2019", "2020"],
  series: [
    { name: "USA", ranks: [1, 2, 1] },
    { name: "China", ranks: [2, 1, 2] },
    { name: "Germany", ranks: [3, 3, 3] },
  ],
};

function renderAdapter(element: ReactElement): void {
  useEChartCalls.length = 0;
  render(element);
}

describe("EChartsBump", () => {
  it("builds inverted yAxis and one line series per entity", () => {
    renderAdapter(
      <EChartsBump
        width={640}
        height={360}
        theme={cleanTheme}
        data={sampleData}
      />,
    );

    const call = useEChartCalls.at(-1);
    const option = call?.option as {
      yAxis?: { inverse?: boolean; min?: number; max?: number };
      series?: Array<{ type?: string; name?: string }>;
    };

    expect(option?.yAxis?.inverse).toBe(true);
    expect(option?.yAxis?.min).toBe(1);
    expect(option?.yAxis?.max).toBe(3);
    expect(option?.series).toHaveLength(3);
    expect(option?.series?.[0]?.type).toBe("line");
    expect(option?.series?.[0]?.name).toBe("USA");
  });

  it("passes mergeOption for live updates", () => {
    renderAdapter(
      <EChartsBump
        width={640}
        height={360}
        theme={cleanTheme}
        data={sampleData}
        mergeOption
      />,
    );

    const call = useEChartCalls.at(-1);
    expect(call?.mergeOption).toBe(true);
  });
});
