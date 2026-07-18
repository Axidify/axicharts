import { useEffect, useRef, useState, type ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  CandlestickChart,
  ChartContainer,
  FunnelChart,
  PieChart,
  TreemapChart,
  type OhlcPoint,
  type TreemapNode,
} from "@axicharts/charts";
import { liveTheme } from "@axicharts/charts-theme";

const TICK_MS = 200; // 5 Hz

const INITIAL_SLICES = [
  { name: "Product", value: 48, tone: "info" as const },
  { name: "Services", value: 28, tone: "success" as const },
  { name: "Support", value: 14, tone: "warning" as const },
  { name: "Other", value: 10 },
];

const INITIAL_STAGES = [
  { name: "Leads", value: 240, tone: "info" as const },
  { name: "Qualified", value: 160 },
  { name: "Proposal", value: 92, tone: "warning" as const },
  { name: "Won", value: 48, tone: "success" as const },
];

const INITIAL_TREEMAP: TreemapNode[] = [
  {
    name: "Compute",
    children: [
      { name: "EC2", value: 42_000, tone: "info" as const },
      { name: "Lambda", value: 12_500 },
      { name: "EKS", value: 18_200, tone: "success" as const },
    ],
  },
  {
    name: "Storage",
    children: [
      { name: "S3", value: 9_800, tone: "warning" as const },
      { name: "EBS", value: 6_400 },
    ],
  },
  {
    name: "Data",
    children: [
      { name: "RDS", value: 15_600 },
      { name: "Redshift", value: 11_300, tone: "critical" as const },
    ],
  },
];

function bumpTreemap(nodes: TreemapNode[], tick: number): TreemapNode[] {
  const drift = Math.round(Math.sin(tick / 4) * 200);
  return nodes.map((group, groupIndex) => ({
    ...group,
    children: group.children?.map((leaf, leafIndex) => ({
      ...leaf,
      value: Math.max(
        1_000,
        (leaf.value ?? 0) +
          drift +
          (groupIndex === 0 && leafIndex === 0
            ? 800
            : groupIndex === 2 && leafIndex === 1
              ? -400
              : 0),
      ),
    })),
  }));
}

const BAR_COUNT = 32;
const SESSIONS = Array.from({ length: BAR_COUNT }, (_, index) => {
  const totalMinutes = 9 * 60 + 30 + index * 5;
  const hour = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
});

function buildOhlc(seed: number): { data: OhlcPoint[]; volume: number[] } {
  let price = 182.4 + Math.sin(seed / 4) * 2;
  const data = SESSIONS.map((_, index) => {
    const open = price;
    const delta = Math.sin((seed + index) / 3) * 0.35 + (Math.random() - 0.5) * 0.4;
    const close = open + delta;
    const high = Math.max(open, close) + Math.random() * 0.35;
    const low = Math.min(open, close) - Math.random() * 0.35;
    price = close;
    return {
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
    };
  });
  const volume = SESSIONS.map(
    (_, index) =>
      Number((0.8 + Math.abs(Math.sin((seed + index) / 5)) * 1.8).toFixed(2)) *
      1_000_000,
  );
  return { data, volume };
}

const INITIAL_OHLC = buildOhlc(0);

function LiveEChartsBreadthDemo(): ReactElement {
  const [tick, setTick] = useState(0);
  const [slices, setSlices] = useState(INITIAL_SLICES);
  const [stages, setStages] = useState(INITIAL_STAGES);
  const [nodes, setNodes] = useState(INITIAL_TREEMAP);
  const [ohlc, setOhlc] = useState(INITIAL_OHLC);
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
        setStages((currentStages) =>
          currentStages.map((stage, index) => ({
            ...stage,
            value: Math.max(
              8,
              stage.value + (index === 0 ? 3 : index === 3 ? 1 : -1),
            ),
          })),
        );
        setOhlc(buildOhlc(next));
        setNodes((currentNodes) => bumpTreemap(currentNodes, next));
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
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 12,
        }}
      >
        <ChartContainer theme={liveTheme} mode="live" height={240} width="100%">
          <PieChart slices={slices} innerRadius={38} showLabels />
        </ChartContainer>
        <ChartContainer theme={liveTheme} mode="live" height={240} width="100%">
          <CandlestickChart
            categories={SESSIONS}
            data={ohlc.data}
            volume={ohlc.volume}
          />
        </ChartContainer>
        <ChartContainer theme={liveTheme} mode="live" height={240} width="100%">
          <FunnelChart stages={stages} />
        </ChartContainer>
        <ChartContainer theme={liveTheme} mode="live" height={240} width="100%">
          <TreemapChart nodes={nodes} />
        </ChartContainer>
      </div>
      <p style={{ marginTop: 10, fontSize: 12, color: "#94a3b8" }}>
        C106 — ECharts exotic <code>mode: live</code> merge path @ 5 Hz · tick{" "}
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
          "C106 — pie, candlestick, funnel, and treemap panels share the Heatmap-style `mergeOption` live update path at 5 Hz without full chart rebuilds.",
      },
    },
  },
} satisfies Meta<typeof LiveEChartsBreadthDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ThreePanelWall: Story = {
  render: () => <LiveEChartsBreadthDemo />,
};
