import { useEffect, useRef, useState, type ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  ChartContainer,
  HeatmapChart,
  PieChart,
  RadarChart,
  ScatterChart,
  SunburstChart,
  WordCloudChart,
  type HierarchyNode,
} from "@axicharts/charts";
import { liveTheme } from "@axicharts/charts-theme";

const TICK_MS = 200; // 5 Hz

const INITIAL_SLICES = [
  { name: "Product", value: 48, tone: "info" as const },
  { name: "Services", value: 28, tone: "success" as const },
  { name: "Support", value: 14, tone: "warning" as const },
  { name: "Other", value: 10 },
];

const INITIAL_SUNBURST: HierarchyNode[] = [
  {
    name: "Platform",
    children: [
      {
        name: "API",
        children: [
          { name: "Auth", value: 420 },
          { name: "Orders", value: 680, tone: "info" as const },
        ],
      },
      {
        name: "Workers",
        children: [
          { name: "ETL", value: 540, tone: "warning" as const },
          { name: "Alerts", value: 310 },
        ],
      },
    ],
  },
];

const INITIAL_SCATTER = [
  {
    name: "Regions",
    points: [
      { x: 12, y: 48, name: "US-East" },
      { x: 28, y: 62, name: "EU-West" },
      { x: 44, y: 38, name: "APAC" },
      { x: 58, y: 71, name: "US-West" },
      { x: 72, y: 55, name: "LATAM" },
    ],
  },
];

const INITIAL_RADAR_INDICATORS = [
  { name: "Latency" },
  { name: "Throughput" },
  { name: "Errors" },
  { name: "Cost" },
  { name: "Saturation" },
];

const INITIAL_RADAR_SERIES = [
  { name: "Cluster A", values: [72, 84, 18, 46, 63], tone: "info" as const },
  { name: "Cluster B", values: [58, 76, 24, 52, 71] },
];

const INITIAL_HEATMAP = {
  xCategories: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  yCategories: ["API", "DB", "Cache", "Queue"],
  values: [
    [42, 38, 55, 48, 61],
    [28, 31, 44, 39, 52],
    [18, 22, 26, 24, 29],
    [12, 15, 19, 17, 21],
  ],
};

const INITIAL_WORDS = [
  { text: "timeout", value: 42, tone: "critical" as const },
  { text: "retry", value: 28, tone: "warning" as const },
  { text: "latency", value: 24 },
  { text: "cache", value: 18, tone: "success" as const },
  { text: "queue", value: 14 },
  { text: "auth", value: 11 },
];

function bumpSunburst(nodes: HierarchyNode[], tick: number): HierarchyNode[] {
  const drift = Math.round(Math.sin(tick / 5) * 12);
  return nodes.map((group) => ({
    ...group,
    children: group.children?.map((branch) => ({
      ...branch,
      children: branch.children?.map((leaf, index) => ({
        ...leaf,
        value: Math.max(80, (leaf.value ?? 0) + drift + (index % 2 === 0 ? 6 : -3)),
      })),
    })),
  }));
}

function LiveEChartsBreadthDemo(): ReactElement {
  const [tick, setTick] = useState(0);
  const [slices, setSlices] = useState(INITIAL_SLICES);
  const [sunburst, setSunburst] = useState(INITIAL_SUNBURST);
  const [scatter, setScatter] = useState(INITIAL_SCATTER);
  const [radarSeries, setRadarSeries] = useState(INITIAL_RADAR_SERIES);
  const [heatmap, setHeatmap] = useState(INITIAL_HEATMAP);
  const [words, setWords] = useState(INITIAL_WORDS);
  const lastFrameRef = useRef(performance.now());
  const [frameMs, setFrameMs] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const now = performance.now();
      setFrameMs(now - lastFrameRef.current);
      lastFrameRef.current = now;

      setTick((current) => {
        const next = current + 1;
        setSlices((currentSlices) =>
          currentSlices.map((slice, index) => ({
            ...slice,
            value: Math.max(
              6,
              slice.value + (index === 0 ? 2 : index === 2 ? -1 : 0),
            ),
          })),
        );
        setSunburst((currentNodes) => bumpSunburst(currentNodes, next));
        setScatter((currentSeries) =>
          currentSeries.map((item) => ({
            ...item,
            points: item.points.map((point, index) => ({
              ...point,
              y: Math.max(10, point.y + (index % 2 === 0 ? 2 : -1)),
            })),
          })),
        );
        setRadarSeries((currentSeries) =>
          currentSeries.map((item, seriesIndex) => ({
            ...item,
            values: item.values.map((value, index) =>
              Math.max(
                8,
                value + (seriesIndex === 0 ? 2 : -1) + (index === 2 ? -2 : 0),
              ),
            ),
          })),
        );
        setHeatmap((current) => ({
          ...current,
          values: current.values.map((row, rowIndex) =>
            row.map((cell, colIndex) =>
              Math.max(4, cell + (rowIndex + colIndex + next) % 3),
            ),
          ),
        }));
        setWords((currentWords) =>
          currentWords.map((word, index) => ({
            ...word,
            value: Math.max(4, word.value + (index % 2 === 0 ? 2 : -1)),
          })),
        );
        return next;
      });
    }, TICK_MS);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div style={{ maxWidth: 960 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 12,
        }}
      >
        <ChartContainer theme={liveTheme} mode="live" height={220} width="100%">
          <PieChart slices={slices} innerRadius={38} showLabels />
        </ChartContainer>
        <ChartContainer theme={liveTheme} mode="live" height={220} width="100%">
          <ScatterChart series={scatter} />
        </ChartContainer>
        <ChartContainer theme={liveTheme} mode="live" height={220} width="100%">
          <RadarChart
            indicators={INITIAL_RADAR_INDICATORS}
            series={radarSeries}
          />
        </ChartContainer>
        <ChartContainer theme={liveTheme} mode="live" height={220} width="100%">
          <SunburstChart nodes={sunburst} />
        </ChartContainer>
        <ChartContainer theme={liveTheme} mode="live" height={220} width="100%">
          <HeatmapChart matrix={heatmap} />
        </ChartContainer>
        <ChartContainer theme={liveTheme} mode="live" height={220} width="100%">
          <WordCloudChart words={words} />
        </ChartContainer>
      </div>
      <p style={{ marginTop: 10, fontSize: 12, color: "#94a3b8" }}>
        C117 — ECharts breadth <code>mode: live</code> merge path @ 5 Hz · tick{" "}
        {tick} · last frame {frameMs.toFixed(1)} ms (target {TICK_MS} ms)
      </p>
    </div>
  );
}

const meta = {
  title: "Charts/Live ECharts breadth",
  component: LiveEChartsBreadthDemo,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "C117 — pie, scatter, radar, sunburst, heatmap, and word cloud share the `mergeOption` live update path at 5 Hz without full chart rebuilds.",
      },
    },
  },
} satisfies Meta<typeof LiveEChartsBreadthDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LiveBreadthWall: Story = {
  render: () => <LiveEChartsBreadthDemo />,
};

/** @deprecated Use `LiveBreadthWall` — kept for bookmarked Storybook URLs. */
export const ThreePanelWall: Story = {
  render: () => <LiveEChartsBreadthDemo />,
};
