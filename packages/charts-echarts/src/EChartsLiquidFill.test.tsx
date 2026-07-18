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

vi.mock("./useLiquidFillExtension", () => ({
  useLiquidFillExtension: () => true,
}));

import { EChartsLiquidFill, normalizeLiquidFillValue } from "./EChartsLiquidFill";

function renderAdapter(element: ReactElement): void {
  useEChartCalls.length = 0;
  render(element);
}

describe("EChartsLiquidFill", () => {
  it("normalizes percentage values above 1 to 0–1 range", () => {
    expect(normalizeLiquidFillValue(72)).toBe(0.72);
    expect(normalizeLiquidFillValue(0.45)).toBe(0.45);
  });

  it("builds liquidFill series with normalized data", () => {
    renderAdapter(
      <EChartsLiquidFill
        width={320}
        height={280}
        theme={cleanTheme}
        value={72}
        label="Tank A"
      />,
    );

    const call = useEChartCalls.at(-1);
    const series = (
      call?.option as { series?: Array<{ type?: string; data?: number[] }> }
    )?.series?.[0];
    expect(series?.type).toBe("liquidFill");
    expect(series?.data).toEqual([0.72]);
  });

  it("passes mergeOption and disables wave animation in live mode", () => {
    renderAdapter(
      <EChartsLiquidFill
        width={320}
        height={280}
        theme={cleanTheme}
        value={0.5}
        mergeOption
        waveAnimation={false}
      />,
    );

    const call = useEChartCalls.at(-1);
    expect(call?.mergeOption).toBe(true);
    const series = (
      call?.option as { series?: Array<{ waveAnimation?: boolean }> }
    )?.series?.[0];
    expect(series?.waveAnimation).toBe(false);
  });
});
