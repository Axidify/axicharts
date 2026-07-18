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

import { EChartsSwarm } from "./EChartsSwarm";

const sampleItems = [
  {
    category: "API",
    values: [12, 18, 22, 28, 35, 42, 55, 72, 88, 120],
  },
  {
    category: "DB",
    values: [8, 14, 20, 26, 34, 48, 60, 78, 95, 110],
  },
];

function renderAdapter(element: ReactElement): void {
  useEChartCalls.length = 0;
  render(element);
}

describe("EChartsSwarm", () => {
  it("builds scatter series per group with category axis", () => {
    renderAdapter(
      <EChartsSwarm
        width={640}
        height={360}
        theme={cleanTheme}
        items={sampleItems}
      />,
    );

    const call = useEChartCalls.at(-1);
    const option = call?.option as {
      xAxis?: { type?: string; data?: string[] };
      series?: Array<{ type?: string; name?: string; data?: unknown[] }>;
    };

    expect(option?.xAxis?.type).toBe("category");
    expect(option?.xAxis?.data).toEqual(["API", "DB"]);
    expect(option?.series).toHaveLength(1);
    expect(option?.series?.[0]?.type).toBe("scatter");
    expect(option?.series?.[0]?.name).toBe("Distribution");
    expect(option?.series?.[0]?.data?.length).toBe(20);
  });

  it("passes mergeOption for live updates", () => {
    renderAdapter(
      <EChartsSwarm
        width={640}
        height={360}
        theme={cleanTheme}
        items={sampleItems}
        mergeOption
      />,
    );

    const call = useEChartCalls.at(-1);
    expect(call?.mergeOption).toBe(true);
  });

  it("adds median line series when enabled", () => {
    renderAdapter(
      <EChartsSwarm
        width={640}
        height={360}
        theme={cleanTheme}
        items={sampleItems}
        showMedianLine
      />,
    );

    const call = useEChartCalls.at(-1);
    const option = call?.option as {
      series?: Array<{ type?: string; name?: string }>;
    };
    expect(option?.series).toHaveLength(2);
    expect(option?.series?.[1]?.type).toBe("line");
    expect(option?.series?.[1]?.name).toBe("Distribution median");
  });
});
