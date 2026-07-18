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

import { EChartsGraph } from "./EChartsGraph";

const sampleData = {
  categories: [{ name: "Core" }, { name: "Data" }],
  nodes: [
    { id: "api", name: "API", category: 0, value: 120 },
    { id: "db", name: "DB", category: 1, value: 80 },
    { id: "cache", name: "Cache", category: 1, value: 60 },
  ],
  edges: [
    { source: "api", target: "db", value: 42 },
    { source: "api", target: "cache", value: 28 },
  ],
};

function renderAdapter(element: ReactElement): void {
  useEChartCalls.length = 0;
  render(element);
}

describe("EChartsGraph", () => {
  it("builds graph series with force layout", () => {
    renderAdapter(
      <EChartsGraph
        width={640}
        height={360}
        theme={cleanTheme}
        data={sampleData}
      />,
    );

    const call = useEChartCalls.at(-1);
    const option = call?.option as {
      series?: Array<{
        type?: string;
        layout?: string;
        roam?: boolean;
        draggable?: boolean;
        force?: { repulsion?: number; layoutAnimation?: boolean };
      }>;
    };

    expect(option?.series).toHaveLength(1);
    expect(option?.series?.[0]?.type).toBe("graph");
    expect(option?.series?.[0]?.layout).toBe("force");
    expect(option?.series?.[0]?.roam).toBe(true);
    expect(option?.series?.[0]?.draggable).toBe(true);
    expect(option?.series?.[0]?.force?.repulsion).toBe(220);
    expect(option?.series?.[0]?.force?.layoutAnimation).toBe(true);
  });

  it("disables layout animation in live merge mode", () => {
    renderAdapter(
      <EChartsGraph
        width={640}
        height={360}
        theme={cleanTheme}
        data={sampleData}
        mergeOption
      />,
    );

    const call = useEChartCalls.at(-1);
    const option = call?.option as {
      series?: Array<{ force?: { layoutAnimation?: boolean } }>;
    };

    expect(call?.mergeOption).toBe(true);
    expect(option?.series?.[0]?.force?.layoutAnimation).toBe(false);
  });
});
