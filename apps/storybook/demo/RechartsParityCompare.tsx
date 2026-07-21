import { useMemo, type ReactElement } from "react";
import {
  ChartContainer,
  HistogramChart,
  RadarChart,
  ScatterChart,
} from "@axicharts/charts";
import { cleanTheme } from "@axicharts/charts-theme";
import { compilePanel, type PanelSpec } from "@axicharts/charts-spec";
import {
  Area,
  AreaChart as RechartsAreaChart,
  Bar as RechartsBar,
  BarChart as RechartsBarChart,
  Cell as RechartsCell,
  Legend,
  Line,
  LineChart as RechartsLineChart,
  Pie,
  PieChart as RechartsPieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart as RechartsRadarChart,
  Scatter,
  ScatterChart as RechartsScatterChart,
  XAxis as RechartsXAxis,
  YAxis as RechartsYAxis,
} from "recharts";
import areaSloSpec from "../../../packages/charts-spec/examples/area-slo-line.panel.json";
import comboSpec from "../../../packages/charts-spec/examples/combo-revenue-bar-line.panel.json";
import donutSpec from "../../../packages/charts-spec/examples/browser-share-donut.panel.json";
import multiLineSpec from "../../../packages/charts-spec/examples/burndown-multi-line.panel.json";
import revenueLineSpec from "../../../packages/charts-spec/examples/revenue-line.panel.json";
import stackedBarSpec from "../../../packages/charts-spec/examples/velocity-stacked-bar.panel.json";
import stackedBar4Spec from "../../../packages/charts-spec/examples/velocity-stacked-bar-4.panel.json";
import throughputSpec from "../../../packages/charts-spec/examples/throughput-bar-color.panel.json";

export const TILE_W = 360;
export const TILE_H = 280;

const REVENUE_ROWS = [
  { day: "Mon", revenue: 4200 },
  { day: "Tue", revenue: 3800 },
  { day: "Wed", revenue: 5100 },
  { day: "Thu", revenue: 4600 },
  { day: "Fri", revenue: 5900 },
];

const THROUGHPUT_ROWS = [
  { week: "W1", throughput: 120, aboveTarget: true },
  { week: "W2", throughput: 90, aboveTarget: false },
  { week: "W3", throughput: 150, aboveTarget: true },
  { week: "W4", throughput: 110, aboveTarget: false },
  { week: "W5", throughput: 180, aboveTarget: true },
];

const LATENCY_ROWS = [
  { day: "Mon", latency: 42, meets_slo: true },
  { day: "Tue", latency: 58, meets_slo: false },
  { day: "Wed", latency: 35, meets_slo: true },
  { day: "Thu", latency: 72, meets_slo: false },
  { day: "Fri", latency: 48, meets_slo: true },
];

const COMBO_ROWS = [
  { week: "W1", total: 120, avg: 17 },
  { week: "W2", total: 90, avg: 13 },
  { week: "W3", total: 150, avg: 21 },
  { week: "W4", total: 110, avg: 16 },
  { week: "W5", total: 180, avg: 26 },
];

const SPRINT_ROWS = [
  { sprint: "S1", done: 22, carry: 6 },
  { sprint: "S2", done: 26, carry: 4 },
  { sprint: "S3", done: 24, carry: 5 },
  { sprint: "S4", done: 28, carry: 3 },
];

const SPRINT_4_ROWS = [
  { sprint: "S1", done: 18, review: 4, blocked: 2, carry: 3 },
  { sprint: "S2", done: 20, review: 5, blocked: 1, carry: 4 },
  { sprint: "S3", done: 19, review: 3, blocked: 3, carry: 2 },
  { sprint: "S4", done: 22, review: 4, blocked: 1, carry: 3 },
];

const PRIORITY_ROWS = [
  { priority: "P1 – Critical", count: 12 },
  { priority: "P2 – High", count: 28 },
  { priority: "P3 – Medium", count: 45 },
  { priority: "P4 – Low", count: 19 },
];

export const BROWSER_SHARE_ROWS = [
  { name: "Chrome", value: 48 },
  { name: "Safari", value: 28 },
  { name: "Firefox", value: 14 },
  { name: "Other", value: 10 },
];

const PRIORITY_COLORS: Record<string, string> = {
  "P1 – Critical": "#f43f5e",
  "P2 – High": "#f59e0b",
  "P3 – Medium": "#3b82f6",
  "P4 – Low": "#64748b",
};

const BURNDOWN_ROWS = [
  { day: "D1", remaining: 120, ideal: 120 },
  { day: "D2", remaining: 108, ideal: 108 },
  { day: "D3", remaining: 96, ideal: 96 },
  { day: "D4", remaining: 88, ideal: 84 },
  { day: "D5", remaining: 74, ideal: 72 },
  { day: "D6", remaining: 68, ideal: 60 },
  { day: "D7", remaining: 58, ideal: 48 },
];

export const DONUT_COLORS = ["#2563eb", "#16a34a", "#d97706", "#64748b"];

const SCATTER_HOLDINGS = [
  { name: "AAPL", risk: 0.22, return: 0.18 },
  { name: "MSFT", risk: 0.19, return: 0.16 },
  { name: "NVDA", risk: 0.41, return: 0.52 },
  { name: "JPM", risk: 0.24, return: 0.11 },
  { name: "XOM", risk: 0.28, return: 0.09 },
  { name: "UNH", risk: 0.17, return: 0.13 },
  { name: "TSLA", risk: 0.48, return: 0.31 },
  { name: "PG", risk: 0.12, return: 0.07 },
];

const SCATTER_BENCHMARKS = [
  { name: "S&P 500", risk: 0.16, return: 0.1 },
  { name: "NASDAQ", risk: 0.21, return: 0.14 },
  { name: "Small cap", risk: 0.27, return: 0.12 },
];

const RADAR_INDICATORS = [
  { name: "Reliability", max: 100 },
  { name: "Latency", max: 100 },
  { name: "Throughput", max: 100 },
  { name: "Cost", max: 100 },
  { name: "Security", max: 100 },
];

const RADAR_SERIES = [
  { name: "Current", tone: "info" as const, values: [82, 74, 88, 63, 91] },
  { name: "Target", tone: "success" as const, values: [90, 85, 92, 75, 95] },
];

/** Flattened rows for Recharts Radar (one row per indicator). */
const RADAR_RECHARTS_ROWS = RADAR_INDICATORS.map((indicator, index) => ({
  metric: indicator.name,
  Current: RADAR_SERIES[0]!.values[index]!,
  Target: RADAR_SERIES[1]!.values[index]!,
}));

const HISTOGRAM_CATEGORIES = ["0–50", "50–100", "100–200", "200–400", "400–800", "800+"];
const HISTOGRAM_VALUES = [42, 118, 256, 189, 73, 22];
const HISTOGRAM_ROWS = HISTOGRAM_CATEGORIES.map((bin, index) => ({
  bin,
  count: HISTOGRAM_VALUES[index]!,
}));

const BROWSER_SHARE_CHART_CONFIG = Object.fromEntries(
  BROWSER_SHARE_ROWS.map((row, index) => [
    row.name,
    { color: DONUT_COLORS[index % DONUT_COLORS.length] },
  ]),
);

/** Tile compare: no in-panel title (row label only) + Recharts-matched slice colors. */
export const DONUT_PARITY_SPEC = {
  ...(donutSpec as PanelSpec),
  title: undefined,
  props: {
    ...((donutSpec as PanelSpec).props ?? {}),
    chartConfig: BROWSER_SHARE_CHART_CONFIG,
    centerMetric: "largest",
  },
} satisfies PanelSpec;

const PRIORITY_PANEL: PanelSpec = {
  specVersion: 1,
  type: "cartesian",
  theme: "clean",
  mode: "static",
  encoding: {
    x: { field: "priority", type: "nominal" },
    color: { field: "priority", type: "nominal" },
  },
  marks: [{ type: "bar", field: "count", label: "Tickets" }],
};

export type ParityCaseMeta = {
  id: string;
  title: string;
  category: "cartesian" | "distribution";
  designId?: string;
};

export const PARITY_CASES: ParityCaseMeta[] = [
  { id: "line-revenue", title: "Line — revenue trend", category: "cartesian", designId: "D-103" },
  {
    id: "bar-color",
    title: "Bar — encoding.color (throughput vs target)",
    category: "cartesian",
    designId: "D-102",
  },
  {
    id: "horizontal-priority",
    title: "Horizontal bar — priority breakdown",
    category: "cartesian",
    designId: "D-101",
  },
  {
    id: "stacked-velocity",
    title: "Stacked bar — sprint velocity",
    category: "cartesian",
    designId: "D-102",
  },
  {
    id: "combo-bar-line",
    title: "Combo — bar + line",
    category: "cartesian",
    designId: "D-104",
  },
  {
    id: "area-slo",
    title: "Area — latency SLO coloring",
    category: "cartesian",
    designId: "D-103",
  },
  {
    id: "multi-line-burndown",
    title: "Multi-series line — burndown",
    category: "cartesian",
    designId: "D-103",
  },
  {
    id: "donut-browser",
    title: "Donut — browser share",
    category: "distribution",
    designId: "D-201",
  },
  {
    id: "scatter-risk-return",
    title: "Scatter — risk vs return",
    category: "cartesian",
    designId: "D-110",
  },
  {
    id: "radar-scorecard",
    title: "Radar — ops scorecard",
    category: "distribution",
    designId: "D-210",
  },
  {
    id: "histogram-latency",
    title: "Histogram — response time bins",
    category: "distribution",
    designId: "D-202",
  },
  {
    id: "stacked-breakdown-4",
    title: "Stacked bar — 4-series color ramp",
    category: "cartesian",
    designId: "D-102",
  },
];

type ComparisonCase = ParityCaseMeta & {
  axi: ReactElement;
  recharts: ReactElement;
};

function Tile({ children }: { children: ReactElement }): ReactElement {
  return (
    <div
      style={{
        width: TILE_W,
        height: TILE_H,
        border: "1px solid #e2e8f0",
        borderRadius: 8,
        background: "#ffffff",
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
}

function CompareColumnLabel({
  tone,
  children,
}: {
  tone: "axi" | "recharts";
  children: string;
}): ReactElement {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        marginBottom: 8,
        color: tone === "axi" ? "#2563eb" : "#64748b",
      }}
    >
      {children}
    </div>
  );
}

function buildComparisonCases(): ComparisonCase[] {
  return [
    {
      ...PARITY_CASES[0]!,
      axi: (
        <div style={{ width: TILE_W, height: TILE_H }}>
          {compilePanel(revenueLineSpec as PanelSpec, REVENUE_ROWS, { height: TILE_H })}
        </div>
      ),
      recharts: (
        <RechartsLineChart width={TILE_W} height={TILE_H} data={REVENUE_ROWS}>
          <RechartsXAxis dataKey="day" tick={{ fontSize: 11 }} />
          <RechartsYAxis tick={{ fontSize: 11 }} width={36} />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </RechartsLineChart>
      ),
    },
    {
      ...PARITY_CASES[1]!,
      axi: (
        <div style={{ width: TILE_W, height: TILE_H }}>
          {compilePanel(throughputSpec as PanelSpec, THROUGHPUT_ROWS, { height: TILE_H })}
        </div>
      ),
      recharts: (
        <RechartsBarChart width={TILE_W} height={TILE_H} data={THROUGHPUT_ROWS}>
          <RechartsXAxis dataKey="week" tick={{ fontSize: 11 }} />
          <RechartsYAxis tick={{ fontSize: 11 }} width={36} />
          <RechartsBar dataKey="throughput" radius={[4, 4, 0, 0]}>
            {THROUGHPUT_ROWS.map((row) => (
              <RechartsCell
                key={row.week}
                fill={row.aboveTarget ? "#16a34a" : "#d97706"}
              />
            ))}
          </RechartsBar>
        </RechartsBarChart>
      ),
    },
    {
      ...PARITY_CASES[2]!,
      axi: (
        <div style={{ width: TILE_W, height: TILE_H }}>
          {compilePanel(
            { ...PRIORITY_PANEL, orientation: "horizontal" } satisfies PanelSpec,
            PRIORITY_ROWS,
            { height: TILE_H },
          )}
        </div>
      ),
      recharts: (
        <RechartsBarChart
          width={TILE_W}
          height={TILE_H}
          data={PRIORITY_ROWS}
          layout="vertical"
          margin={{ left: 96, right: 12, top: 8, bottom: 24 }}
        >
          <RechartsXAxis type="number" tick={{ fontSize: 11 }} />
          <RechartsYAxis
            type="category"
            dataKey="priority"
            tick={{ fontSize: 11 }}
            width={92}
          />
          <RechartsBar dataKey="count" radius={[0, 4, 4, 0]} isAnimationActive={false}>
            {PRIORITY_ROWS.map((row) => (
              <RechartsCell key={row.priority} fill={PRIORITY_COLORS[row.priority]} />
            ))}
          </RechartsBar>
        </RechartsBarChart>
      ),
    },
    {
      ...PARITY_CASES[3]!,
      axi: (
        <div style={{ width: TILE_W, height: TILE_H }}>
          {compilePanel(stackedBarSpec as PanelSpec, [], { height: TILE_H })}
        </div>
      ),
      recharts: (
        <RechartsBarChart width={TILE_W} height={TILE_H} data={SPRINT_ROWS}>
          <RechartsXAxis dataKey="sprint" tick={{ fontSize: 11 }} />
          <RechartsYAxis tick={{ fontSize: 11 }} width={36} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <RechartsBar stackId="velocity" dataKey="done" fill="#16a34a" />
          <RechartsBar stackId="velocity" dataKey="carry" fill="#d97706" />
        </RechartsBarChart>
      ),
    },
    {
      ...PARITY_CASES[4]!,
      axi: (
        <div style={{ width: TILE_W, height: TILE_H }}>
          {compilePanel(comboSpec as PanelSpec, COMBO_ROWS, { height: TILE_H })}
        </div>
      ),
      recharts: (
        <RechartsBarChart width={TILE_W} height={TILE_H} data={COMBO_ROWS}>
          <RechartsXAxis dataKey="week" tick={{ fontSize: 11 }} />
          <RechartsYAxis tick={{ fontSize: 11 }} width={36} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <RechartsBar dataKey="total" fill="#2563eb" radius={[4, 4, 0, 0]} />
          <Line
            type="monotone"
            dataKey="avg"
            stroke="#d97706"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </RechartsBarChart>
      ),
    },
    {
      ...PARITY_CASES[5]!,
      axi: (
        <div style={{ width: TILE_W, height: TILE_H }}>
          {compilePanel(areaSloSpec as PanelSpec, LATENCY_ROWS, { height: TILE_H })}
        </div>
      ),
      recharts: (
        <RechartsAreaChart width={TILE_W} height={TILE_H} data={LATENCY_ROWS}>
          <RechartsXAxis dataKey="day" tick={{ fontSize: 11 }} />
          <RechartsYAxis tick={{ fontSize: 11 }} width={36} />
          <Area
            type="monotone"
            dataKey="latency"
            stroke="#2563eb"
            fill="#2563eb"
            fillOpacity={0.15}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </RechartsAreaChart>
      ),
    },
    {
      ...PARITY_CASES[6]!,
      axi: (
        <div style={{ width: TILE_W, height: TILE_H }}>
          {compilePanel(multiLineSpec as PanelSpec, [], { height: TILE_H })}
        </div>
      ),
      recharts: (
        <RechartsLineChart width={TILE_W} height={TILE_H} data={BURNDOWN_ROWS}>
          <RechartsXAxis dataKey="day" tick={{ fontSize: 11 }} />
          <RechartsYAxis tick={{ fontSize: 11 }} width={36} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line
            type="monotone"
            dataKey="remaining"
            stroke="#d97706"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="ideal"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </RechartsLineChart>
      ),
    },
    {
      ...PARITY_CASES[7]!,
      axi: (
        <div style={{ width: TILE_W, height: TILE_H }}>
          {compilePanel(DONUT_PARITY_SPEC, BROWSER_SHARE_ROWS, { height: TILE_H })}
        </div>
      ),
      recharts: (
        <RechartsPieChart width={TILE_W} height={TILE_H}>
          <Pie
            data={BROWSER_SHARE_ROWS}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="46%"
            innerRadius={58}
            outerRadius={88}
            isAnimationActive={false}
          >
            {BROWSER_SHARE_ROWS.map((row, index) => (
              <RechartsCell key={row.name} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
            ))}
          </Pie>
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </RechartsPieChart>
      ),
    },
    {
      ...PARITY_CASES[8]!,
      axi: (
        <div style={{ width: TILE_W, height: TILE_H }}>
          <ChartContainer theme={cleanTheme} height={TILE_H} width={TILE_W}>
            <ScatterChart
              series={[
                {
                  name: "Holdings",
                  tone: "info",
                  points: SCATTER_HOLDINGS.map((item) => ({
                    x: item.risk,
                    y: item.return,
                    label: item.name,
                  })),
                },
                {
                  name: "Benchmarks",
                  tone: "default",
                  points: SCATTER_BENCHMARKS.map((item) => ({
                    x: item.risk,
                    y: item.return,
                    label: item.name,
                  })),
                },
              ]}
              xLabel="Risk"
              yLabel="Return"
              showPointLabels={false}
            />
          </ChartContainer>
        </div>
      ),
      recharts: (
        <RechartsScatterChart width={TILE_W} height={TILE_H} margin={{ top: 12, right: 12, bottom: 28, left: 8 }}>
          <RechartsXAxis
            type="number"
            dataKey="risk"
            name="Risk"
            tick={{ fontSize: 11 }}
            domain={[0, 0.55]}
          />
          <RechartsYAxis
            type="number"
            dataKey="return"
            name="Return"
            tick={{ fontSize: 11 }}
            width={36}
            domain={[0, 0.6]}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Scatter
            name="Holdings"
            data={SCATTER_HOLDINGS}
            fill="#2563eb"
            isAnimationActive={false}
          />
          <Scatter
            name="Benchmarks"
            data={SCATTER_BENCHMARKS}
            fill="#64748b"
            isAnimationActive={false}
          />
        </RechartsScatterChart>
      ),
    },
    {
      ...PARITY_CASES[9]!,
      axi: (
        <div style={{ width: TILE_W, height: TILE_H }}>
          <ChartContainer theme={cleanTheme} height={TILE_H} width={TILE_W}>
            <RadarChart
              indicators={RADAR_INDICATORS}
              series={RADAR_SERIES}
              showLabels={false}
              areaFill
            />
          </ChartContainer>
        </div>
      ),
      recharts: (
        <RechartsRadarChart width={TILE_W} height={TILE_H} data={RADAR_RECHARTS_ROWS} cx="50%" cy="46%" outerRadius="54%">
          <PolarGrid />
          <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10 }} />
          <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
          <Radar
            name="Current"
            dataKey="Current"
            stroke="#2563eb"
            fill="#2563eb"
            fillOpacity={0.18}
            isAnimationActive={false}
          />
          <Radar
            name="Target"
            dataKey="Target"
            stroke="#16a34a"
            fill="#16a34a"
            fillOpacity={0.12}
            isAnimationActive={false}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </RechartsRadarChart>
      ),
    },
    {
      ...PARITY_CASES[10]!,
      axi: (
        <div style={{ width: TILE_W, height: TILE_H }}>
          <ChartContainer theme={cleanTheme} height={TILE_H} width={TILE_W}>
            <HistogramChart
              categories={HISTOGRAM_CATEGORIES}
              values={HISTOGRAM_VALUES}
              tone="info"
            />
          </ChartContainer>
        </div>
      ),
      recharts: (
        <RechartsBarChart width={TILE_W} height={TILE_H} data={HISTOGRAM_ROWS} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
          <RechartsXAxis dataKey="bin" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={48} />
          <RechartsYAxis tick={{ fontSize: 11 }} width={36} />
          <RechartsBar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} isAnimationActive={false} />
        </RechartsBarChart>
      ),
    },
    {
      ...PARITY_CASES[11]!,
      axi: (
        <div style={{ width: TILE_W, height: TILE_H }}>
          {compilePanel(stackedBar4Spec as PanelSpec, [], { height: TILE_H })}
        </div>
      ),
      recharts: (
        <RechartsBarChart width={TILE_W} height={TILE_H} data={SPRINT_4_ROWS}>
          <RechartsXAxis dataKey="sprint" tick={{ fontSize: 11 }} />
          <RechartsYAxis tick={{ fontSize: 11 }} width={36} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <RechartsBar stackId="velocity" dataKey="done" fill="#2563eb" radius={[0, 0, 0, 0]} />
          <RechartsBar stackId="velocity" dataKey="review" fill="#0891b2" />
          <RechartsBar stackId="velocity" dataKey="blocked" fill="#16a34a" />
          <RechartsBar stackId="velocity" dataKey="carry" fill="#d97706" radius={[4, 4, 0, 0]} />
        </RechartsBarChart>
      ),
    },
  ];
}

function ParityRow({ item }: { item: ComparisonCase }): ReactElement {
  return (
    <section
      id={`parity-${item.id}`}
      style={{
        paddingBottom: 24,
        borderBottom: "1px solid #e2e8f0",
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: "#0f172a" }}>
        {item.title}
        {item.designId ? (
          <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 500, color: "#94a3b8" }}>
            {item.designId}
          </span>
        ) : null}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(2, minmax(${TILE_W}px, 1fr))`,
          gap: 16,
          alignItems: "start",
        }}
      >
        <div>
          <CompareColumnLabel tone="axi">AxiCharts @ 360×280</CompareColumnLabel>
          <Tile>{item.axi}</Tile>
        </div>
        <div>
          <CompareColumnLabel tone="recharts">Recharts @ 360×280</CompareColumnLabel>
          <Tile>{item.recharts}</Tile>
        </div>
      </div>
    </section>
  );
}

export type RechartsParityCompareProps = {
  filter?: "all" | "cartesian" | "distribution";
  caseIds?: string[];
};

export function RechartsParityCompare({
  filter = "all",
  caseIds,
}: RechartsParityCompareProps): ReactElement {
  const cases = useMemo(() => buildComparisonCases(), []);
  const visibleCases = useMemo(() => {
    let next = cases;
    if (caseIds?.length) {
      const allowed = new Set(caseIds);
      next = next.filter((item) => allowed.has(item.id));
    } else if (filter !== "all") {
      next = next.filter((item) => item.category === filter);
    }
    return next;
  }, [cases, filter, caseIds]);

  return (
    <div style={{ display: "grid", gap: 28 }}>
      {visibleCases.map((item) => (
        <ParityRow key={item.id} item={item} />
      ))}
    </div>
  );
}
