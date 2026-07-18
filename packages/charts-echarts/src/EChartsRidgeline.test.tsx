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

import { EChartsRidgeline } from "./EChartsRidgeline";

const sampleItems = [
  {
    category: "API",
    samples: [12, 18, 22, 28, 35, 42, 55, 72, 88, 120],
  },
  {
    category: "DB",
    samples: [8, 14, 20, 26, 34, 48, 60, 78, 95, 110],
  },
];

function renderAdapter(element: ReactElement): void {
  useEChartCalls.length = 0;
  render(element);
}

describe("EChartsRidgeline", () => {
  it("builds custom series per group with value x-axis and category y-axis", () => {
    renderAdapter(
      <EChartsRidgeline
        width={640}
        height={360}
        theme={cleanTheme}
        items={sampleItems}
      />,
    );

    const call = useEChartCalls.at(-1);
    const option = call?.option as {
      xAxis?: { type?: string };
      yAxis?: { type?: string; data?: string[]; inverse?: boolean };
      series?: Array<{ type?: string; name?: string; data?: unknown[] }>;
    };

    expect(option?.xAxis?.type).toBe("value");
    expect(option?.yAxis?.type).toBe("category");
    expect(option?.yAxis?.data).toEqual(["API", "DB"]);
    expect(option?.yAxis?.inverse).toBe(true);
    expect(option?.series).toHaveLength(1);
    expect(option?.series?.[0]?.type).toBe("custom");
    expect(option?.series?.[0]?.name).toBe("Distribution");
    expect(option?.series?.[0]?.data).toHaveLength(2);
  });

  it("passes mergeOption for live updates", () => {
    renderAdapter(
      <EChartsRidgeline
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
});
