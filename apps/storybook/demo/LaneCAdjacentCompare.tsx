import { useMemo, type ReactElement } from "react";
import {
  BoxplotChart,
  CandlestickChart,
  ChartContainer,
  Digital,
  Gauge,
  LiquidFillChart,
  RidgelineChart,
  StatusLamp,
  SunburstChart,
  SwarmChart,
  TreemapChart,
  ViolinChart,
} from "@axicharts/charts";
import { cleanTheme, industrialTheme } from "@axicharts/charts-theme";

const NICHE_CATALOG_W = 280;
const NICHE_CATALOG_H = 140;
const INDUSTRIAL_TILE_W = 180;
const INDUSTRIAL_TILE_H = 120;

const BOXPLOT_ITEMS = [
  { category: "API", min: 12, q1: 28, median: 45, q3: 72, max: 140 },
  { category: "DB", min: 8, q1: 18, median: 32, q3: 58, max: 110 },
];

const VIOLIN_ITEMS = [
  { category: "API", samples: [12, 18, 22, 28, 35, 42, 55, 72] },
  { category: "DB", samples: [8, 14, 20, 26, 34, 48, 60, 78] },
];

const TREEMAP_NODES = [
  {
    name: "Compute",
    children: [
      { name: "EC2", value: 42 },
      { name: "Lambda", value: 12 },
    ],
  },
  { name: "Storage", children: [{ name: "S3", value: 18 }] },
];

const CANDLE_DAYS = ["Mon", "Tue", "Wed"];
const CANDLE_DATA = [
  { open: 100, high: 108, low: 98, close: 105 },
  { open: 105, high: 110, low: 102, close: 103 },
  { open: 103, high: 106, low: 99, close: 101 },
];

const SWARM_ITEMS = [
  { category: "API", values: [12, 18, 22, 28, 35, 42, 55, 72] },
  { category: "DB", values: [8, 14, 20, 26, 34, 48, 60, 78] },
];

const RIDGELINE_ITEMS = [
  { category: "API", samples: [12, 18, 22, 28, 35, 42, 55, 72] },
  { category: "DB", samples: [8, 14, 20, 26, 34, 48, 60, 78] },
];

const SUNBURST_NODES = [
  {
    name: "Equities",
    children: [
      { name: "US", value: 38 },
      { name: "Intl", value: 18 },
    ],
  },
  { name: "Bonds", children: [{ name: "Treasury", value: 16 }] },
];

type LaneCCase = {
  id: string;
  title: string;
  designId: string;
  lane: "analytics" | "industrial";
  width: number;
  height: number;
  chart: ReactElement;
};

function LaneCRow({ item }: { item: LaneCCase }): ReactElement {
  return (
    <section
      id={`lane-c-${item.id}`}
      style={{
        paddingBottom: 20,
        borderBottom: "1px solid #e2e8f0",
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: "#0f172a" }}>
        {item.title}
        <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 500, color: "#94a3b8" }}>
          {item.designId} · {item.width}×{item.height}
        </span>
      </div>
      <div
        style={{
          width: item.width,
          height: item.height,
          border: "1px solid #e2e8f0",
          borderRadius: 8,
          overflow: "hidden",
          background: item.lane === "industrial" ? "#0f172a" : "#ffffff",
        }}
      >
        {item.chart}
      </div>
    </section>
  );
}

function buildLaneCCases(): LaneCCase[] {
  return [
    {
      id: "boxplot-catalog-140",
      title: "Boxplot — service latency",
      designId: "D-401",
      lane: "analytics",
      width: NICHE_CATALOG_W,
      height: NICHE_CATALOG_H,
      chart: (
        <ChartContainer theme={cleanTheme} width={NICHE_CATALOG_W} height={NICHE_CATALOG_H}>
          <BoxplotChart items={BOXPLOT_ITEMS} valueSuffix=" ms" />
        </ChartContainer>
      ),
    },
    {
      id: "violin-catalog-140",
      title: "Violin — latency density",
      designId: "D-402",
      lane: "analytics",
      width: NICHE_CATALOG_W,
      height: NICHE_CATALOG_H,
      chart: (
        <ChartContainer theme={cleanTheme} width={NICHE_CATALOG_W} height={NICHE_CATALOG_H}>
          <ViolinChart items={VIOLIN_ITEMS} showAxes={false} />
        </ChartContainer>
      ),
    },
    {
      id: "treemap-catalog-140",
      title: "Treemap — cost breakdown",
      designId: "D-403",
      lane: "analytics",
      width: NICHE_CATALOG_W,
      height: NICHE_CATALOG_H,
      chart: (
        <ChartContainer theme={cleanTheme} width={NICHE_CATALOG_W} height={NICHE_CATALOG_H}>
          <TreemapChart nodes={TREEMAP_NODES} />
        </ChartContainer>
      ),
    },
    {
      id: "candlestick-catalog-140",
      title: "Candlestick — 3-day strip",
      designId: "D-404",
      lane: "analytics",
      width: NICHE_CATALOG_W,
      height: NICHE_CATALOG_H,
      chart: (
        <ChartContainer theme={cleanTheme} width={NICHE_CATALOG_W} height={NICHE_CATALOG_H}>
          <CandlestickChart categories={CANDLE_DAYS} data={CANDLE_DATA} />
        </ChartContainer>
      ),
    },
    {
      id: "gauge-industrial-120",
      title: "Gauge — OEE",
      designId: "D-405",
      lane: "industrial",
      width: INDUSTRIAL_TILE_W,
      height: INDUSTRIAL_TILE_H,
      chart: (
        <ChartContainer
          theme={industrialTheme}
          width={INDUSTRIAL_TILE_W}
          height={INDUSTRIAL_TILE_H}
        >
          <Gauge value={78} min={0} max={100} label="OEE" unit="%" warningAt={75} criticalAt={90} />
        </ChartContainer>
      ),
    },
    {
      id: "liquid-industrial-120",
      title: "Liquid fill — tank level",
      designId: "D-406",
      lane: "industrial",
      width: INDUSTRIAL_TILE_W,
      height: INDUSTRIAL_TILE_H,
      chart: (
        <ChartContainer
          theme={industrialTheme}
          width={INDUSTRIAL_TILE_W}
          height={INDUSTRIAL_TILE_H}
        >
          <LiquidFillChart value={0.68} label="Tank" tone="info" />
        </ChartContainer>
      ),
    },
    {
      id: "digital-industrial-120",
      title: "Digital — line speed",
      designId: "D-407",
      lane: "industrial",
      width: INDUSTRIAL_TILE_W,
      height: INDUSTRIAL_TILE_H,
      chart: (
        <ChartContainer
          theme={industrialTheme}
          width={INDUSTRIAL_TILE_W}
          height={INDUSTRIAL_TILE_H}
        >
          <Digital value={1428} unit=" rpm" label="Line speed" />
        </ChartContainer>
      ),
    },
    {
      id: "status-lamp-industrial-120",
      title: "Status lamp — line state",
      designId: "D-408",
      lane: "industrial",
      width: INDUSTRIAL_TILE_W,
      height: INDUSTRIAL_TILE_H,
      chart: (
        <ChartContainer
          theme={industrialTheme}
          width={INDUSTRIAL_TILE_W}
          height={INDUSTRIAL_TILE_H}
        >
          <StatusLamp status="running" label="Line 3" />
        </ChartContainer>
      ),
    },
    {
      id: "swarm-catalog-140",
      title: "Swarm — latency jitter",
      designId: "D-409",
      lane: "analytics",
      width: NICHE_CATALOG_W,
      height: NICHE_CATALOG_H,
      chart: (
        <ChartContainer theme={cleanTheme} width={NICHE_CATALOG_W} height={NICHE_CATALOG_H}>
          <SwarmChart items={SWARM_ITEMS} showAxes={false} />
        </ChartContainer>
      ),
    },
    {
      id: "ridgeline-catalog-140",
      title: "Ridgeline — latency density",
      designId: "D-410",
      lane: "analytics",
      width: NICHE_CATALOG_W,
      height: NICHE_CATALOG_H,
      chart: (
        <ChartContainer theme={cleanTheme} width={NICHE_CATALOG_W} height={NICHE_CATALOG_H}>
          <RidgelineChart items={RIDGELINE_ITEMS} showAxes={false} />
        </ChartContainer>
      ),
    },
    {
      id: "sunburst-catalog-140",
      title: "Sunburst — portfolio mix",
      designId: "D-411",
      lane: "analytics",
      width: NICHE_CATALOG_W,
      height: NICHE_CATALOG_H,
      chart: (
        <ChartContainer theme={cleanTheme} width={NICHE_CATALOG_W} height={NICHE_CATALOG_H}>
          <SunburstChart nodes={SUNBURST_NODES} />
        </ChartContainer>
      ),
    },
  ];
}

export function LaneCAdjacentCompare(): ReactElement {
  const cases = useMemo(() => buildLaneCCases(), []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h2 style={{ margin: "0 0 8px", fontSize: 18, color: "#0f172a" }}>
          Lane C — niche / industrial charts
        </h2>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: "#64748b" }}>
          Internal consistency @ catalog card sizes — analytics niche{" "}
          <strong>{NICHE_CATALOG_W}×{NICHE_CATALOG_H}</strong>, industrial HMI{" "}
          <strong>{INDUSTRIAL_TILE_W}×{INDUSTRIAL_TILE_H}</strong>. Not Recharts parity;
          judged on typography, margins, and theme tokens within each lane.
        </p>
      </div>
      {cases.map((item) => (
        <LaneCRow key={item.id} item={item} />
      ))}
    </div>
  );
}
