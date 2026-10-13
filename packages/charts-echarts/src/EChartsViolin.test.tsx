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

import { EChartsViolin } from "./EChartsViolin";
import { countFilledShapes, renderOptionToSvg, svgTexts } from "./testing/renderOptionToSvg";

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

describe("EChartsViolin", () => {
  it("builds custom series per group with category axis", () => {
    renderAdapter(
      <EChartsViolin
        width={640}
        height={360}
        theme={cleanTheme}
        items={sampleItems}
      />,
    );

    const call = useEChartCalls.at(-1);
    const option = call?.option as {
      xAxis?: { type?: string; data?: string[] };
      series?: Array<{ type?: string; name?: string }>;
    };

    expect(option?.xAxis?.type).toBe("category");
    expect(option?.xAxis?.data).toEqual(["API", "DB"]);
    expect(option?.series).toHaveLength(1);
    expect(option?.series?.[0]?.type).toBe("custom");
    expect(option?.series?.[0]?.name).toBe("Distribution");
  });

  it("passes mergeOption for live updates", () => {
    renderAdapter(
      <EChartsViolin
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
  it("draws a filled shape per category through real ECharts", () => {
    renderAdapter(
      <EChartsViolin width={640} height={360} theme={cleanTheme} items={sampleItems} />,
    );
    const option = useEChartCalls.at(-1)?.option as Record<string, unknown>;
    const svg = renderOptionToSvg(option);

    // Regression: KDE arrays used to ride in custom-series `value`, which ECharts
    // coerces to numbers — renderItem saw NaN and drew nothing.
    expect(countFilledShapes(svg)).toBeGreaterThanOrEqual(sampleItems.length);
    // Value axis spans the samples, not the category indices (0..n-1).
    const ticks = svgTexts(svg).map(Number).filter(Number.isFinite);
    expect(Math.max(...ticks)).toBeGreaterThanOrEqual(100);
  });
});
