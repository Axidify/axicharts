import { useMemo, type ReactElement } from "react";
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
  XAxis as RechartsXAxis,
  YAxis as RechartsYAxis,
} from "recharts";
import areaSloSpec from "../../../packages/charts-spec/examples/area-slo-line.panel.json";
import comboSpec from "../../../packages/charts-spec/examples/combo-revenue-bar-line.panel.json";
import donutSpec from "../../../packages/charts-spec/examples/browser-share-donut.panel.json";
import multiLineSpec from "../../../packages/charts-spec/examples/burndown-multi-line.panel.json";
import revenueLineSpec from "../../../packages/charts-spec/examples/revenue-line.panel.json";
import stackedBarSpec from "../../../packages/charts-spec/examples/velocity-stacked-bar.panel.json";
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
