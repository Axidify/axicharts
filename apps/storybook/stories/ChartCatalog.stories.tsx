import type { ReactElement, ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  BoxplotChart,
  BumpChart,
  CalendarHeatmapChart,
  CandlestickChart,
  ChartContainer,
  ComboChart,
  Digital,
  FunnelChart,
  Gauge,
  GraphChart,
  HeatmapChart,
  HistogramChart,
  LineChart,
  LiquidFillChart,
  ParallelChart,
  PictorialBarChart,
  RadarChart,
  ScatterChart,
  Stat,
  StatusLamp,
  SunburstChart,
  ThemeRiverChart,
  TreemapChart,
  ViolinChart,
  SwarmChart,
  RidgelineChart,
  WaterfallChart,
  WordCloudChart,
  type ComboSeries,
  type HeatmapMatrix,
  type CalendarHeatmapData,
  type BumpChartData,
  type GraphChartData,
} from "@axicharts/charts";
import { Chart } from "@axicharts/charts-spec";
import { cleanTheme, industrialTheme } from "@axicharts/charts-theme";
import { MapChart, SAMPLE_US_TOPOLOGY, SAMPLE_US_VALUES } from "@axicharts/charts-map";
import { SankeyChart, SAMPLE_SANKEY_FLOW } from "@axicharts/charts-sankey";
import { GeoMapChart, SAMPLE_GEO_REGIONS } from "@axicharts/charts-geo";
import { GanttChart, SAMPLE_GANTT_PROGRAM } from "@axicharts/charts-gantt";
import { TankChart } from "@axicharts/charts-tank";
import "@axicharts/charts-map/register";
import "@axicharts/charts-sankey/register";
import "@axicharts/charts-geo/register";
import "@axicharts/charts-gantt/register";
import "@axicharts/charts-tank/register";
import throughputSpec from "../../../packages/charts-spec/examples/throughput-bar-color.panel.json";
import areaSloSpec from "../../../packages/charts-spec/examples/area-slo-line.panel.json";
import donutSpec from "../../../packages/charts-spec/examples/browser-share-donut.panel.json";
import stackedBarSpec from "../../../packages/charts-spec/examples/velocity-stacked-bar.panel.json";
import type { PanelSpec } from "@axicharts/charts-spec";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const LATENCY = [42, 38, 55, 49, 62];
const THROUGHPUT_ROWS = [
  { week: "W1", throughput: 120, aboveTarget: true },
  { week: "W2", throughput: 90, aboveTarget: false },
  { week: "W3", throughput: 150, aboveTarget: true },
  { week: "W4", throughput: 110, aboveTarget: false },
];
const LATENCY_ROWS = [
  { day: "Mon", latency: 42, meets_slo: true },
  { day: "Tue", latency: 58, meets_slo: false },
  { day: "Wed", latency: 35, meets_slo: true },
  { day: "Thu", latency: 72, meets_slo: false },
];
const BROWSER_SHARE_ROWS = [
  { name: "Chrome", value: 48 },
  { name: "Safari", value: 28 },
  { name: "Firefox", value: 14 },
  { name: "Other", value: 10 },
];

const QUARTERS = ["Q1", "Q2", "Q3", "Q4"];

const COMBO_SERIES: ComboSeries[] = [
  { name: "Total", kind: "bar", data: [120, 90, 150, 110], tone: "info" },
  { name: "Avg", kind: "line", data: [17, 13, 21, 16], tone: "success" },
];

const SCATTER_POINTS = [
  { name: "AAPL", risk: 0.22, return: 0.18 },
  { name: "MSFT", risk: 0.19, return: 0.16 },
  { name: "NVDA", risk: 0.41, return: 0.52 },
];

const PNL_ITEMS = [
  { name: "Revenue", value: 1200 },
  { name: "COGS", value: -420 },
  { name: "OpEx", value: -280 },
  { name: "Net", value: 500, isTotal: true },
];

const CANDLE_DATA = [
  { open: 100, high: 108, low: 98, close: 105 },
  { open: 105, high: 110, low: 102, close: 103 },
  { open: 103, high: 106, low: 99, close: 101 },
];

const HEATMAP: HeatmapMatrix = {
  xCategories: ["9:00", "12:00", "15:00"],
  yCategories: ["A", "B", "C"],
  values: [
    [0.2, 0.5, 0.8],
    [0.4, 0.6, 0.3],
    [0.7, 0.4, 0.5],
  ],
};

const RADAR_INDICATORS = [
  { name: "Reliability", max: 100 },
  { name: "Latency", max: 100 },
  { name: "Cost", max: 100 },
];
const RADAR_SERIES = [
  { name: "Current", tone: "info" as const, values: [82, 74, 63] },
];

const PARALLEL_DIMS = [
  { name: "CPU", field: "cpu", max: 100 },
  { name: "Mem", field: "mem", max: 100 },
  { name: "Latency", field: "lat", max: 50 },
];
const PARALLEL_SERIES = [
  { name: "east", values: [62, 71, 18] },
  { name: "west", values: [48, 58, 12] },
];

const THEME_RIVER = [
  { time: "W1", value: 42, series: "API" },
  { time: "W1", value: 28, series: "Workers" },
  { time: "W2", value: 48, series: "API" },
  { time: "W2", value: 32, series: "Workers" },
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

const WORDS = [
  { text: "latency", value: 36, tone: "warning" as const },
  { text: "timeout", value: 28, tone: "critical" as const },
  { text: "retry", value: 22 },
  { text: "cache", value: 15 },
];

const CALENDAR_COMPACT: CalendarHeatmapData = {
  year: 2026,
  points: [
    { date: "2026-07-14", value: 4 },
    { date: "2026-07-15", value: 7 },
    { date: "2026-07-16", value: 2 },
    { date: "2026-07-17", value: 9 },
    { date: "2026-07-18", value: 6 },
  ],
};

const PICTORIAL_ITEMS = [
  { category: "A", value: 42, symbol: "rect" },
  { category: "B", value: 28, symbol: "roundRect" },
  { category: "C", value: 18, symbol: "triangle" },
];

const BUMP_COMPACT: BumpChartData = {
  categories: ["Q1", "Q2", "Q3"],
  series: [
    { name: "Alpha", ranks: [1, 2, 1] },
    { name: "Beta", ranks: [2, 1, 2] },
    { name: "Gamma", ranks: [3, 3, 3] },
  ],
};

const GRAPH_COMPACT: GraphChartData = {
  nodes: [
    { id: "api", name: "API", value: 120, tone: "info" as const },
    { id: "auth", name: "Auth", value: 80, tone: "success" as const },
    { id: "db", name: "DB", value: 60 },
    { id: "cache", name: "Cache", value: 45 },
  ],
  edges: [
    { source: "api", target: "auth", value: 42 },
    { source: "api", target: "db", value: 36 },
    { source: "api", target: "cache", value: 28 },
    { source: "auth", target: "db", value: 18 },
  ],
};

const VIOLIN_COMPACT = [
  { category: "API", samples: [12, 18, 22, 28, 35, 42, 55, 72] },
  { category: "DB", samples: [8, 14, 20, 26, 34, 48, 60, 78] },
];

const SWARM_COMPACT = [
  { category: "API", values: [12, 18, 22, 28, 35, 42, 55, 72] },
  { category: "DB", values: [8, 14, 20, 26, 34, 48, 60, 78] },
];

const RIDGELINE_COMPACT = [
  { category: "API", samples: [12, 18, 22, 28, 35, 42, 55, 72] },
  { category: "DB", samples: [8, 14, 20, 26, 34, 48, 60, 78] },
];

/** Compact catalog fixtures — strip panel chrome that duplicates card labels. */
function catalogPanel(spec: PanelSpec): PanelSpec {
  const { title: _title, valueSuffix: _suffix, ...rest } = spec;
  const compact: PanelSpec = { ...rest, height: 120 };
  if (compact.type === "donut" || compact.type === "pie") {
    return {
      ...compact,
      props: { ...compact.props, showLabels: false },
    };
  }
  if (compact.type === "bar") {
    return {
      ...compact,
      props: { ...compact.props, showValues: false },
    };
  }
  return compact;
}

const CATALOG_CHART_HEIGHT = 120;

const FUNNEL = [
  { name: "Leads", value: 240, tone: "info" as const },
  { name: "Qualified", value: 160 },
  { name: "Won", value: 48, tone: "success" as const },
];

const BOXPLOT = [
  { category: "API", min: 12, q1: 28, median: 45, q3: 72, max: 140 },
  { category: "DB", min: 8, q1: 18, median: 32, q3: 58, max: 110 },
];

const HISTOGRAM = {
  categories: ["0–50", "50–100", "100–200", "200+"],
  values: [42, 118, 256, 73],
};

function CatalogCard({
  label,
  children,
  span,
}: {
  label: string;
  children: ReactNode;
  span?: boolean;
}): ReactElement {
  return (
    <div
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: 10,
        background: "#ffffff",
        overflow: "hidden",
        gridColumn: span ? "1 / -1" : undefined,
      }}
    >
      <div
        style={{
          padding: "8px 12px",
          borderBottom: "1px solid #f1f5f9",
          fontSize: 11,
          fontWeight: 600,
          color: "#64748b",
          letterSpacing: "0.02em",
        }}
      >
        {label}
      </div>
      <div style={{ padding: 10, minHeight: 0 }}>{children}</div>
    </div>
  );
}

function ChartCatalogWall(): ReactElement {
  return (
    <div
      style={{
        maxWidth: 1080,
        padding: 20,
        background: "#f8fafc",
        borderRadius: 12,
      }}
    >
      <header style={{ marginBottom: 20 }}>
        <h2 style={{ margin: "0 0 6px", fontSize: 20, color: "#0f172a" }}>
          Shipped chart types
        </h2>
        <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
          Compact catalog wall — Cartesian, distribution, financial, matrix, industrial, and
          community plugins. Full demos in sibling Storybook folders.
        </p>
      </header>

      <section style={{ marginBottom: 24 }}>
        <h3 style={sectionTitle}>Cartesian</h3>
        <div style={grid}>
          <CatalogCard label="Line">
            <ChartContainer theme={cleanTheme} height={120} width="100%">
              <LineChart
                categories={DAYS}
                series={[{ name: "p95", data: LATENCY }]}
                fill
              />
            </ChartContainer>
          </CatalogCard>
          <CatalogCard label="Bar">
            <Chart
              panel={catalogPanel(throughputSpec as PanelSpec)}
              data={THROUGHPUT_ROWS}
              height={CATALOG_CHART_HEIGHT}
            />
          </CatalogCard>
          <CatalogCard label="Area">
            <Chart
              panel={catalogPanel(areaSloSpec as PanelSpec)}
              data={LATENCY_ROWS}
              height={CATALOG_CHART_HEIGHT}
            />
          </CatalogCard>
          <CatalogCard label="Combo">
            <ChartContainer theme={cleanTheme} height={120} width="100%">
              <ComboChart categories={QUARTERS} series={COMBO_SERIES} />
            </ChartContainer>
          </CatalogCard>
          <CatalogCard label="Stacked bar">
            <Chart
              panel={catalogPanel(stackedBarSpec as PanelSpec)}
              data={[]}
              height={CATALOG_CHART_HEIGHT}
            />
          </CatalogCard>
          <CatalogCard label="Scatter">
            <ChartContainer theme={cleanTheme} height={120} width="100%">
              <ScatterChart
                series={[
                  {
                    name: "Holdings",
                    points: SCATTER_POINTS.map((p) => ({
                      x: p.risk,
                      y: p.return,
                      label: p.name,
                    })),
                  },
                ]}
                showAxes={false}
                showPointLabels
              />
            </ChartContainer>
          </CatalogCard>
        </div>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h3 style={sectionTitle}>Distribution</h3>
        <div style={grid}>
          <CatalogCard label="Pie / donut">
            <Chart
              panel={catalogPanel(donutSpec as PanelSpec)}
              data={BROWSER_SHARE_ROWS}
              height={CATALOG_CHART_HEIGHT}
            />
          </CatalogCard>
          <CatalogCard label="Funnel">
            <ChartContainer theme={cleanTheme} height={140} width="100%">
              <FunnelChart stages={FUNNEL} />
            </ChartContainer>
          </CatalogCard>
          <CatalogCard label="Boxplot">
            <ChartContainer theme={cleanTheme} height={140} width="100%">
              <BoxplotChart items={BOXPLOT} />
            </ChartContainer>
          </CatalogCard>
          <CatalogCard label="Histogram">
            <ChartContainer theme={cleanTheme} height={140} width="100%">
              <HistogramChart
                categories={HISTOGRAM.categories}
                values={HISTOGRAM.values}
                tone="info"
              />
            </ChartContainer>
          </CatalogCard>
          <CatalogCard label="Pictorial bar">
            <ChartContainer theme={cleanTheme} height={140} width="100%">
              <PictorialBarChart items={PICTORIAL_ITEMS} />
            </ChartContainer>
          </CatalogCard>
        </div>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h3 style={sectionTitle}>Financial</h3>
        <div style={grid}>
          <CatalogCard label="Waterfall">
            <ChartContainer theme={cleanTheme} height={140} width="100%">
              <WaterfallChart items={PNL_ITEMS} />
            </ChartContainer>
          </CatalogCard>
          <CatalogCard label="Candlestick">
            <ChartContainer theme={cleanTheme} height={140} width="100%">
              <CandlestickChart categories={DAYS.slice(0, 3)} data={CANDLE_DATA} />
            </ChartContainer>
          </CatalogCard>
        </div>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h3 style={sectionTitle}>Matrix &amp; hierarchy</h3>
        <div style={grid}>
          <CatalogCard label="Heatmap">
            <ChartContainer theme={cleanTheme} height={140} width="100%">
              <HeatmapChart matrix={HEATMAP} min={0} max={1} />
            </ChartContainer>
          </CatalogCard>
          <CatalogCard label="Calendar heatmap">
            <ChartContainer theme={cleanTheme} height={140} width="100%">
              <CalendarHeatmapChart data={CALENDAR_COMPACT} showLabels={false} />
            </ChartContainer>
          </CatalogCard>
          <CatalogCard label="Radar">
            <ChartContainer theme={cleanTheme} height={140} width="100%">
              <RadarChart indicators={RADAR_INDICATORS} series={RADAR_SERIES} />
            </ChartContainer>
          </CatalogCard>
          <CatalogCard label="Parallel">
            <ChartContainer theme={cleanTheme} height={140} width="100%">
              <ParallelChart dimensions={PARALLEL_DIMS} series={PARALLEL_SERIES} />
            </ChartContainer>
          </CatalogCard>
          <CatalogCard label="Theme river">
            <ChartContainer theme={cleanTheme} height={140} width="100%">
              <ThemeRiverChart points={THEME_RIVER} />
            </ChartContainer>
          </CatalogCard>
          <CatalogCard label="Bump">
            <ChartContainer theme={cleanTheme} height={140} width="100%">
              <BumpChart data={BUMP_COMPACT} showLabels={false} showAxes={false} />
            </ChartContainer>
          </CatalogCard>
          <CatalogCard label="Network graph">
            <ChartContainer theme={cleanTheme} height={140} width="100%">
              <GraphChart data={GRAPH_COMPACT} roam={false} />
            </ChartContainer>
          </CatalogCard>
          <CatalogCard label="Violin">
            <ChartContainer theme={cleanTheme} height={140} width="100%">
              <ViolinChart items={VIOLIN_COMPACT} showAxes={false} />
            </ChartContainer>
          </CatalogCard>
          <CatalogCard label="Swarm">
            <ChartContainer theme={cleanTheme} height={140} width="100%">
              <SwarmChart items={SWARM_COMPACT} showAxes={false} />
            </ChartContainer>
          </CatalogCard>
          <CatalogCard label="Ridgeline">
            <ChartContainer theme={cleanTheme} height={140} width="100%">
              <RidgelineChart items={RIDGELINE_COMPACT} showAxes={false} />
            </ChartContainer>
          </CatalogCard>
          <CatalogCard label="Treemap">
            <ChartContainer theme={cleanTheme} height={140} width="100%">
              <TreemapChart nodes={TREEMAP_NODES} />
            </ChartContainer>
          </CatalogCard>
          <CatalogCard label="Sunburst">
            <ChartContainer theme={cleanTheme} height={140} width="100%">
              <SunburstChart nodes={SUNBURST_NODES} />
            </ChartContainer>
          </CatalogCard>
          <CatalogCard label="Word cloud" span>
            <ChartContainer theme={cleanTheme} height={160} width="100%">
              <WordCloudChart
                words={WORDS}
                gridSize={4}
                rotationRange={[-30, 30]}
                sizeRange={[18, 72]}
              />
            </ChartContainer>
          </CatalogCard>
        </div>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h3 style={sectionTitle}>Industrial</h3>
        <div style={grid}>
          <CatalogCard label="Gauge">
            <ChartContainer theme={industrialTheme} height={120} width="100%">
              <Gauge value={78} min={0} max={100} label="OEE" unit="%" />
            </ChartContainer>
          </CatalogCard>
          <CatalogCard label="Stat">
            <div style={{ padding: "8px 4px" }}>
              <Stat value="1,284" label="units/hr" tone="success" />
            </div>
          </CatalogCard>
          <CatalogCard label="Digital">
            <ChartContainer theme={industrialTheme} height={56} width="100%">
              <Digital value={1428} unit="rpm" />
            </ChartContainer>
          </CatalogCard>
          <CatalogCard label="Status lamp">
            <StatusLamp status="running" label="Line 3" />
          </CatalogCard>
          <CatalogCard label="Liquid fill">
            <ChartContainer theme={industrialTheme} height={120} width="100%">
              <LiquidFillChart value={0.68} label="Tank" />
            </ChartContainer>
          </CatalogCard>
        </div>
      </section>

      <section>
        <h3 style={sectionTitle}>Community plugins</h3>
        <p style={{ margin: "0 0 12px", fontSize: 12, color: "#64748b" }}>
          See <strong>Plugins/*</strong> stories for live variants — compact previews below.
        </p>
        <div style={grid}>
          <CatalogCard label="Map">
            <ChartContainer theme={cleanTheme} height={120} width="100%">
              <MapChart topology={SAMPLE_US_TOPOLOGY} values={SAMPLE_US_VALUES} />
            </ChartContainer>
          </CatalogCard>
          <CatalogCard label="Sankey">
            <ChartContainer theme={cleanTheme} height={120} width="100%">
              <SankeyChart {...SAMPLE_SANKEY_FLOW} />
            </ChartContainer>
          </CatalogCard>
          <CatalogCard label="Geo">
            <ChartContainer theme={cleanTheme} height={120} width="100%">
              <GeoMapChart regions={SAMPLE_GEO_REGIONS} />
            </ChartContainer>
          </CatalogCard>
          <CatalogCard label="Gantt">
            <ChartContainer theme={cleanTheme} height={120} width="100%">
              <GanttChart {...SAMPLE_GANTT_PROGRAM} today={11} />
            </ChartContainer>
          </CatalogCard>
          <CatalogCard label="Tank">
            <ChartContainer theme={industrialTheme} height={120} width="100%">
              <TankChart level={68} label="T-1" warningAt={75} />
            </ChartContainer>
          </CatalogCard>
        </div>
      </section>
    </div>
  );
}

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
  gap: 14,
};

const sectionTitle: React.CSSProperties = {
  margin: "0 0 12px",
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "#94a3b8",
};

const meta = {
  title: "Charts/Catalog",
  component: ChartCatalogWall,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "P2 chart catalog — scrollable wall of every shipped chart type with compact fixtures.",
      },
    },
  },
} satisfies Meta<typeof ChartCatalogWall>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllTypes: Story = {
  render: () => <ChartCatalogWall />,
};
