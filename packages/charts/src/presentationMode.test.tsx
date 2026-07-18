import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { cleanTheme } from "@axicharts/charts-theme";
import { ChartLayoutContext } from "./container/ChartLayoutContext";
import { ChartInteractionProvider } from "./interaction/ChartInteractionContext";
import { CandlestickChart } from "./candlestick/CandlestickChart";
import { FunnelChart } from "./funnel/FunnelChart";
import { HeatmapChart } from "./heatmap/HeatmapChart";
import { HistogramChart } from "./histogram/HistogramChart";
import { PieChart } from "./pie/PieChart";
import { RadarChart } from "./radar/RadarChart";
import { ScatterChart } from "./scatter/ScatterChart";
import { TreemapChart } from "./treemap/TreemapChart";
import { WaterfallChart } from "./waterfall/WaterfallChart";

type CapturedProps = Record<string, unknown>;

const captured = {
  pie: null as CapturedProps | null,
  candlestick: null as CapturedProps | null,
  funnel: null as CapturedProps | null,
  treemap: null as CapturedProps | null,
  heatmap: null as CapturedProps | null,
  waterfall: null as CapturedProps | null,
  scatter: null as CapturedProps | null,
  radar: null as CapturedProps | null,
  histogram: null as CapturedProps | null,
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
    EChartsTreemap: (props: CapturedProps) => {
      captured.treemap = props;
      return null;
    },
    EChartsHeatmap: (props: CapturedProps) => {
      captured.heatmap = props;
      return null;
    },
    EChartsWaterfall: (props: CapturedProps) => {
      captured.waterfall = props;
      return null;
    },
    EChartsScatter: (props: CapturedProps) => {
      captured.scatter = props;
      return null;
    },
    EChartsRadar: (props: CapturedProps) => {
      captured.radar = props;
      return null;
    },
    EChartsHistogram: (props: CapturedProps) => {
      captured.histogram = props;
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

  it("passes mergeOption to treemap adapter when mode is live", () => {
    render(
      <TestShell mode="live">
        <TreemapChart
          nodes={[
            {
              name: "Compute",
              children: [{ name: "EC2", value: 42_000 }],
            },
          ]}
        />
      </TestShell>,
    );

    expect(captured.treemap?.mergeOption).toBe(true);
    expect(captured.treemap?.animate).toBe(false);
  });

  it("passes mergeOption to heatmap adapter when mode is live", () => {
    render(
      <TestShell mode="live">
        <HeatmapChart
          matrix={{
            xCategories: ["Mon"],
            yCategories: ["A"],
            values: [[12]],
          }}
        />
      </TestShell>,
    );

    expect(captured.heatmap?.mergeOption).toBe(true);
    expect(captured.heatmap?.animate).toBe(false);
  });
});

describe("presentation mode animation wiring", () => {
  it("enables presentation sweep on heatmap", () => {
    render(
      <TestShell mode="presentation">
        <HeatmapChart
          matrix={{
            xCategories: ["Mon"],
            yCategories: ["A"],
            values: [[12]],
          }}
        />
      </TestShell>,
    );

    expect(captured.heatmap?.animate).toBe(true);
    expect(captured.heatmap?.mergeOption).toBe(false);
  });

  it("enables presentation sweep on waterfall", () => {
    render(
      <TestShell mode="presentation">
        <WaterfallChart items={[{ name: "Q1", value: 100, isTotal: true }]} />
      </TestShell>,
    );

    expect(captured.waterfall?.animate).toBe(true);
  });

  it("enables presentation sweep on scatter", () => {
    render(
      <TestShell mode="presentation">
        <ScatterChart
          series={[{ name: "A", points: [{ x: 1, y: 2 }] }]}
        />
      </TestShell>,
    );

    expect(captured.scatter?.animate).toBe(true);
  });

  it("enables presentation sweep on radar", () => {
    render(
      <TestShell mode="presentation">
        <RadarChart
          indicators={[{ name: "Speed" }]}
          series={[{ name: "Team", values: [80] }]}
        />
      </TestShell>,
    );

    expect(captured.radar?.animate).toBe(true);
  });

  it("enables presentation sweep on histogram", () => {
    render(
      <TestShell mode="presentation">
        <HistogramChart categories={["0-10"]} values={[4]} />
      </TestShell>,
    );

    expect(captured.histogram?.animate).toBe(true);
  });
});
