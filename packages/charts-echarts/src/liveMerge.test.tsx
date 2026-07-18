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

vi.mock("./useWordCloudExtension", () => ({
  useWordCloudExtension: () => true,
}));

import { EChartsCandlestick } from "./EChartsCandlestick";
import { EChartsFunnel } from "./EChartsFunnel";
import { EChartsParallel } from "./EChartsParallel";
import { EChartsPie } from "./EChartsPie";
import { EChartsRadar } from "./EChartsRadar";
import { EChartsScatter } from "./EChartsScatter";
import { EChartsThemeRiver } from "./EChartsThemeRiver";
import { EChartsWordCloud } from "./EChartsWordCloud";
import { EChartsTreemap } from "./EChartsTreemap";
import { withPresentationAnimation } from "./presentationAnimation";

function renderAdapter(element: ReactElement): void {
  useEChartCalls.length = 0;
  render(element);
}

describe("live merge adapters", () => {
  it("passes mergeOption to useEChart for pie in live mode", () => {
    renderAdapter(
      <EChartsPie
        width={320}
        height={240}
        slices={[{ name: "A", value: 10 }]}
        theme={cleanTheme}
        mergeOption
      />,
    );

    const call = useEChartCalls.at(-1);
    expect(call?.mergeOption).toBe(true);
    expect((call?.option as { animation?: boolean }).animation).toBe(false);
  });

  it("keeps presentation animation enabled for pie when animate is true", () => {
    renderAdapter(
      <EChartsPie
        width={320}
        height={240}
        slices={[{ name: "A", value: 10 }]}
        theme={cleanTheme}
        animate
      />,
    );

    const call = useEChartCalls.at(-1);
    expect(call?.mergeOption).toBe(false);
    expect((call?.option as { animation?: boolean }).animation).toBe(true);
  });

  it("passes mergeOption to useEChart for funnel in live mode", () => {
    renderAdapter(
      <EChartsFunnel
        width={320}
        height={240}
        stages={[{ name: "Leads", value: 100 }]}
        theme={cleanTheme}
        mergeOption
      />,
    );

    const call = useEChartCalls.at(-1);
    expect(call?.mergeOption).toBe(true);
    expect((call?.option as { animation?: boolean }).animation).toBe(false);
  });

  it("passes mergeOption to useEChart for candlestick in live mode", () => {
    renderAdapter(
      <EChartsCandlestick
        width={320}
        height={240}
        categories={["09:30", "09:35"]}
        data={[
          { open: 10, high: 12, low: 9, close: 11 },
          { open: 11, high: 13, low: 10, close: 12 },
        ]}
        theme={cleanTheme}
        mergeOption
      />,
    );

    const call = useEChartCalls.at(-1);
    expect(call?.mergeOption).toBe(true);
    expect((call?.option as { animation?: boolean }).animation).toBe(false);
  });

  it("passes mergeOption to useEChart for treemap in live mode", () => {
    renderAdapter(
      <EChartsTreemap
        width={320}
        height={240}
        nodes={[
          {
            name: "Compute",
            children: [{ name: "EC2", value: 42_000 }],
          },
        ]}
        theme={cleanTheme}
        mergeOption
      />,
    );

    const call = useEChartCalls.at(-1);
    expect(call?.mergeOption).toBe(true);
    expect((call?.option as { animation?: boolean }).animation).toBe(false);
  });

  it("passes mergeOption to useEChart for parallel in live mode", () => {
    renderAdapter(
      <EChartsParallel
        width={320}
        height={240}
        dimensions={[
          { name: "CPU", max: 100 },
          { name: "Memory", max: 100 },
        ]}
        series={[{ name: "Host A", values: [42, 68] }]}
        theme={cleanTheme}
        mergeOption
      />,
    );

    const call = useEChartCalls.at(-1);
    expect(call?.mergeOption).toBe(true);
    expect((call?.option as { animation?: boolean }).animation).toBe(false);
  });

  it("passes mergeOption to useEChart for theme river in live mode", () => {
    renderAdapter(
      <EChartsThemeRiver
        width={320}
        height={240}
        points={[
          { time: "2026-01-01", value: 12, series: "API" },
          { time: "2026-01-02", value: 15, series: "API" },
        ]}
        theme={cleanTheme}
        mergeOption
      />,
    );

    const call = useEChartCalls.at(-1);
    expect(call?.mergeOption).toBe(true);
    expect((call?.option as { animation?: boolean }).animation).toBe(false);
  });

  it("passes mergeOption to useEChart for word cloud in live mode", () => {
    renderAdapter(
      <EChartsWordCloud
        width={320}
        height={240}
        words={[
          { text: "timeout", value: 12 },
          { text: "retry", value: 8 },
        ]}
        theme={cleanTheme}
        mergeOption
      />,
    );

    const call = useEChartCalls.at(-1);
    expect(call?.mergeOption).toBe(true);
    expect((call?.option as { animation?: boolean }).animation).toBe(false);
  });

  it("passes mergeOption to useEChart for scatter in live mode", () => {
    renderAdapter(
      <EChartsScatter
        width={320}
        height={240}
        series={[{ name: "A", points: [{ x: 1, y: 2 }] }]}
        theme={cleanTheme}
        mergeOption
      />,
    );

    const call = useEChartCalls.at(-1);
    expect(call?.mergeOption).toBe(true);
    expect((call?.option as { animation?: boolean }).animation).toBe(false);
  });

  it("passes mergeOption to useEChart for radar in live mode", () => {
    renderAdapter(
      <EChartsRadar
        width={320}
        height={240}
        indicators={[{ name: "Speed" }]}
        series={[{ name: "Team", values: [80] }]}
        theme={cleanTheme}
        mergeOption
      />,
    );

    const call = useEChartCalls.at(-1);
    expect(call?.mergeOption).toBe(true);
    expect((call?.option as { animation?: boolean }).animation).toBe(false);
  });

  it("skips replaceMerge on word cloud value-only live updates", () => {
    const { rerender } = render(
      <EChartsWordCloud
        width={320}
        height={240}
        words={[
          { text: "timeout", value: 12 },
          { text: "retry", value: 8 },
        ]}
        theme={cleanTheme}
        mergeOption
      />,
    );

    rerender(
      <EChartsWordCloud
        width={320}
        height={240}
        words={[
          { text: "timeout", value: 14 },
          { text: "retry", value: 9 },
        ]}
        theme={cleanTheme}
        mergeOption
      />,
    );

    const call = useEChartCalls.at(-1);
    expect(call?.mergeOption).toBe(true);
    expect(call?.replaceMerge).toBeNull();
  });
});

describe("withPresentationAnimation", () => {
  it("disables entrance animation but keeps update morph when not presenting", () => {
    const option = withPresentationAnimation({ series: [] }, false);
    expect(option.animation).toBe(false);
    expect(option.animationDuration).toBe(0);
    expect(option.animationDurationUpdate).toBe(280);
  });

  it("enables entrance animation in presentation mode", () => {
    const option = withPresentationAnimation({ series: [] }, true);
    expect(option.animation).toBe(true);
    expect(option.animationDuration).toBe(820);
  });
});
