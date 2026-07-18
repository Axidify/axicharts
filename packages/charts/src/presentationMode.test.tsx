import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { cleanTheme } from "@axicharts/charts-theme";
import { ChartLayoutContext } from "./container/ChartLayoutContext";
import { ChartInteractionProvider } from "./interaction/ChartInteractionContext";
import { BoxplotChart } from "./boxplot/BoxplotChart";
import { ViolinChart } from "./violin/ViolinChart";
import { SwarmChart } from "./swarm/SwarmChart";
import { CandlestickChart } from "./candlestick/CandlestickChart";
import { FunnelChart } from "./funnel/FunnelChart";
import { CalendarHeatmapChart } from "./calendar/CalendarHeatmapChart";
import { HeatmapChart } from "./heatmap/HeatmapChart";
import { HistogramChart } from "./histogram/HistogramChart";
import { ParallelChart } from "./parallel/ParallelChart";
import { PieChart } from "./pie/PieChart";
import { RadarChart } from "./radar/RadarChart";
import { ScatterChart } from "./scatter/ScatterChart";
import { SunburstChart } from "./sunburst/SunburstChart";
import { ThemeRiverChart } from "./themeRiver/ThemeRiverChart";
import { TreemapChart } from "./treemap/TreemapChart";
import { WaterfallChart } from "./waterfall/WaterfallChart";
import { WordCloudChart } from "./wordCloud/WordCloudChart";

type CapturedProps = Record<string, unknown>;

const captured = {
  pie: null as CapturedProps | null,
  candlestick: null as CapturedProps | null,
  funnel: null as CapturedProps | null,
  treemap: null as CapturedProps | null,
  heatmap: null as CapturedProps | null,
  calendar: null as CapturedProps | null,
  waterfall: null as CapturedProps | null,
  scatter: null as CapturedProps | null,
  radar: null as CapturedProps | null,
  sunburst: null as CapturedProps | null,
  boxplot: null as CapturedProps | null,
  histogram: null as CapturedProps | null,
  wordCloud: null as CapturedProps | null,
  parallel: null as CapturedProps | null,
  themeRiver: null as CapturedProps | null,
  violin: null as CapturedProps | null,
  swarm: null as CapturedProps | null,
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
    EChartsCalendarHeatmap: (props: CapturedProps) => {
      captured.calendar = props;
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
    EChartsSunburst: (props: CapturedProps) => {
      captured.sunburst = props;
      return null;
    },
    EChartsBoxplot: (props: CapturedProps) => {
      captured.boxplot = props;
      return null;
    },
    EChartsHistogram: (props: CapturedProps) => {
      captured.histogram = props;
      return null;
    },
    EChartsWordCloud: (props: CapturedProps) => {
      captured.wordCloud = props;
      return null;
    },
    EChartsParallel: (props: CapturedProps) => {
      captured.parallel = props;
      return null;
    },
    EChartsThemeRiver: (props: CapturedProps) => {
      captured.themeRiver = props;
      return null;
    },
    EChartsViolin: (props: CapturedProps) => {
      captured.violin = props;
      return null;
    },
    EChartsSwarm: (props: CapturedProps) => {
      captured.swarm = props;
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

function expectLiveMerge(adapter: CapturedProps | null): void {
  expect(adapter?.mergeOption).toBe(true);
  expect(adapter?.animate).toBe(false);
}

describe("live mode merge wiring", () => {
  it("passes mergeOption to pie adapter when mode is live", () => {
    render(
      <TestShell mode="live">
        <PieChart slices={[{ name: "A", value: 10 }]} />
      </TestShell>,
    );

    expectLiveMerge(captured.pie);
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

  it("does not merge in interactive mode for pie", () => {
    render(
      <TestShell mode="interactive">
        <PieChart slices={[{ name: "A", value: 10 }]} />
      </TestShell>,
    );

    expect(captured.pie?.mergeOption).toBe(false);
    expect(captured.pie?.animate).toBe(false);
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

    expectLiveMerge(captured.candlestick);
  });

  it("passes mergeOption to funnel adapter when mode is live", () => {
    render(
      <TestShell mode="live">
        <FunnelChart stages={[{ name: "Leads", value: 100 }]} />
      </TestShell>,
    );

    expectLiveMerge(captured.funnel);
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

    expectLiveMerge(captured.treemap);
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

    expectLiveMerge(captured.heatmap);
  });

  it("passes mergeOption to calendar heatmap adapter when mode is live", () => {
    render(
      <TestShell mode="live">
        <CalendarHeatmapChart
          data={{
            year: 2026,
            points: [{ date: "2026-07-18", value: 4 }],
          }}
        />
      </TestShell>,
    );

    expectLiveMerge(captured.calendar);
  });

  it("passes mergeOption to scatter adapter when mode is live", () => {
    render(
      <TestShell mode="live">
        <ScatterChart
          series={[{ name: "A", points: [{ x: 1, y: 2 }] }]}
        />
      </TestShell>,
    );

    expectLiveMerge(captured.scatter);
  });

  it("passes mergeOption to radar adapter when mode is live", () => {
    render(
      <TestShell mode="live">
        <RadarChart
          indicators={[{ name: "Speed" }]}
          series={[{ name: "Team", values: [80] }]}
        />
      </TestShell>,
    );

    expectLiveMerge(captured.radar);
  });

  it("passes mergeOption to sunburst adapter when mode is live", () => {
    render(
      <TestShell mode="live">
        <SunburstChart
          nodes={[
            {
              name: "Platform",
              children: [{ name: "API", value: 42 }],
            },
          ]}
        />
      </TestShell>,
    );

    expectLiveMerge(captured.sunburst);
  });

  it("passes mergeOption to boxplot adapter when mode is live", () => {
    render(
      <TestShell mode="live">
        <BoxplotChart
          items={[
            {
              name: "Latency",
              min: 1,
              q1: 4,
              median: 8,
              q3: 12,
              max: 18,
            },
          ]}
        />
      </TestShell>,
    );

    expectLiveMerge(captured.boxplot);
  });

  it("passes mergeOption to violin adapter when mode is live", () => {
    render(
      <TestShell mode="live">
        <ViolinChart
          items={[
            { category: "API", samples: [12, 18, 22, 28] },
          ]}
        />
      </TestShell>,
    );

    expectLiveMerge(captured.violin);
  });

  it("passes mergeOption to swarm adapter when mode is live", () => {
    render(
      <TestShell mode="live">
        <SwarmChart
          items={[
            { category: "API", values: [12, 18, 22, 28] },
          ]}
        />
      </TestShell>,
    );

    expectLiveMerge(captured.swarm);
  });

  it("passes mergeOption to histogram adapter when mode is live", () => {
    render(
      <TestShell mode="live">
        <HistogramChart categories={["0-10"]} values={[4]} />
      </TestShell>,
    );

    expectLiveMerge(captured.histogram);
  });

  it("passes mergeOption to waterfall adapter when mode is live", () => {
    render(
      <TestShell mode="live">
        <WaterfallChart items={[{ name: "Q1", value: 100, isTotal: true }]} />
      </TestShell>,
    );

    expectLiveMerge(captured.waterfall);
  });

  it("passes mergeOption to word cloud adapter when mode is live", () => {
    render(
      <TestShell mode="live">
        <WordCloudChart words={[{ text: "retry", value: 12 }]} />
      </TestShell>,
    );

    expectLiveMerge(captured.wordCloud);
  });

  it("passes mergeOption to parallel adapter when mode is live", () => {
    render(
      <TestShell mode="live">
        <ParallelChart
          dimensions={[{ name: "CPU", max: 100 }]}
          series={[{ name: "Host", values: [42] }]}
        />
      </TestShell>,
    );

    expectLiveMerge(captured.parallel);
  });

  it("passes mergeOption to theme river adapter when mode is live", () => {
    render(
      <TestShell mode="live">
        <ThemeRiverChart
          points={[{ time: "2026-01-01", value: 12, series: "API" }]}
        />
      </TestShell>,
    );

    expectLiveMerge(captured.themeRiver);
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

  it("enables presentation sweep on calendar heatmap", () => {
    render(
      <TestShell mode="presentation">
        <CalendarHeatmapChart
          data={{
            year: 2026,
            points: [{ date: "2026-07-18", value: 4 }],
          }}
        />
      </TestShell>,
    );

    expect(captured.calendar?.animate).toBe(true);
    expect(captured.calendar?.mergeOption).toBe(false);
  });

  it("enables presentation sweep on waterfall", () => {
    render(
      <TestShell mode="presentation">
        <WaterfallChart items={[{ name: "Q1", value: 100, isTotal: true }]} />
      </TestShell>,
    );

    expect(captured.waterfall?.animate).toBe(true);
    expect(captured.waterfall?.mergeOption).toBe(false);
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
    expect(captured.scatter?.mergeOption).toBe(false);
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
    expect(captured.radar?.mergeOption).toBe(false);
  });

  it("enables presentation sweep on sunburst", () => {
    render(
      <TestShell mode="presentation">
        <SunburstChart
          nodes={[
            {
              name: "Platform",
              children: [{ name: "API", value: 42 }],
            },
          ]}
        />
      </TestShell>,
    );

    expect(captured.sunburst?.animate).toBe(true);
    expect(captured.sunburst?.mergeOption).toBe(false);
  });

  it("enables presentation sweep on boxplot", () => {
    render(
      <TestShell mode="presentation">
        <BoxplotChart
          items={[
            {
              name: "Latency",
              min: 1,
              q1: 4,
              median: 8,
              q3: 12,
              max: 18,
            },
          ]}
        />
      </TestShell>,
    );

    expect(captured.boxplot?.animate).toBe(true);
    expect(captured.boxplot?.mergeOption).toBe(false);
  });

  it("enables presentation sweep on histogram", () => {
    render(
      <TestShell mode="presentation">
        <HistogramChart categories={["0-10"]} values={[4]} />
      </TestShell>,
    );

    expect(captured.histogram?.animate).toBe(true);
    expect(captured.histogram?.mergeOption).toBe(false);
  });

  it("enables presentation sweep on violin", () => {
    render(
      <TestShell mode="presentation">
        <ViolinChart
          items={[
            { category: "API", samples: [12, 18, 22, 28, 35] },
          ]}
        />
      </TestShell>,
    );

    expect(captured.violin?.animate).toBe(true);
    expect(captured.violin?.mergeOption).toBe(false);
  });

  it("enables presentation sweep on swarm", () => {
    render(
      <TestShell mode="presentation">
        <SwarmChart
          items={[
            { category: "API", values: [12, 18, 22, 28, 35] },
          ]}
        />
      </TestShell>,
    );

    expect(captured.swarm?.animate).toBe(true);
    expect(captured.swarm?.mergeOption).toBe(false);
  });
});
