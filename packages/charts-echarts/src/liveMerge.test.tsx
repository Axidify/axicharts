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

import { EChartsCandlestick } from "./EChartsCandlestick";
import { EChartsFunnel } from "./EChartsFunnel";
import { EChartsPie } from "./EChartsPie";
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
