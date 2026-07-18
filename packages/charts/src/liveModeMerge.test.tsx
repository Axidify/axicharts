import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { cleanTheme } from "@axicharts/charts-theme";
import { ChartLayoutContext } from "./container/ChartLayoutContext";
import { ChartInteractionProvider } from "./interaction/ChartInteractionContext";
import { CandlestickChart } from "./candlestick/CandlestickChart";
import { FunnelChart } from "./funnel/FunnelChart";
import { PieChart } from "./pie/PieChart";

type CapturedProps = Record<string, unknown>;

const captured = {
  pie: null as CapturedProps | null,
  candlestick: null as CapturedProps | null,
  funnel: null as CapturedProps | null,
};

vi.mock("@axicharts/charts-echarts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@axicharts/charts-echarts")>();
  return {
    ...actual,
    EChartsPie: (props: CapturedProps) => {
      captured.pie = props;
      return null;
    },
    EChartsCandlestick: (props: CapturedProps) => {
      captured.candlestick = props;
      return null;
    },
    EChartsFunnel: (props: CapturedProps) => {
      captured.funnel = props;
      return null;
    },
  };
});

function TestShell({
  mode,
  children,
}: {
  mode: "live" | "presentation" | "interactive";
  children: ReactNode;
}): ReactElement {
  return (
    <ChartLayoutContext.Provider
      value={{
        size: { width: 400, height: 240 },
        ready: true,
        theme: cleanTheme,
        mode,
        dataState: "ready",
        isStale: false,
      }}
    >
      <ChartInteractionProvider>{children}</ChartInteractionProvider>
    </ChartLayoutContext.Provider>
  );
}

describe("live mode merge wiring", () => {
  it("passes mergeOption to pie adapter when mode is live", () => {
    render(
      <TestShell mode="live">
        <PieChart slices={[{ name: "A", value: 10 }]} />
      </TestShell>,
    );

    expect(captured.pie?.mergeOption).toBe(true);
    expect(captured.pie?.animate).toBe(false);
  });

  it("keeps presentation animation on pie without live merge", () => {
    render(
      <TestShell mode="presentation">
        <PieChart slices={[{ name: "A", value: 10 }]} />
      </TestShell>,
    );

    expect(captured.pie?.mergeOption).toBe(false);
    expect(captured.pie?.animate).toBe(true);
  });

  it("passes mergeOption to candlestick adapter when mode is live", () => {
    render(
      <TestShell mode="live">
        <CandlestickChart
          categories={["09:30"]}
          data={[{ open: 10, high: 12, low: 9, close: 11 }]}
        />
      </TestShell>,
    );

    expect(captured.candlestick?.mergeOption).toBe(true);
    expect(captured.candlestick?.animate).toBe(false);
  });

  it("passes mergeOption to funnel adapter when mode is live", () => {
    render(
      <TestShell mode="live">
        <FunnelChart stages={[{ name: "Leads", value: 100 }]} />
      </TestShell>,
    );

    expect(captured.funnel?.mergeOption).toBe(true);
    expect(captured.funnel?.animate).toBe(false);
  });
});
