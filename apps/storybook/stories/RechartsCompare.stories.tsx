import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Bar,
  BarChart,
  Cell,
  ChartContainer,
  LineChart,
  PieChart,
  Stat,
  XAxis,
  YAxis,
} from "@axicharts/charts";
import { Chart } from "@axicharts/charts-spec";
import { cleanTheme } from "@axicharts/charts-theme";
import {
  Area,
  AreaChart,
  Bar as RechartsBar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell as RechartsCell,
  Legend,
  Line,
  LineChart as RechartsLineChart,
  Pie,
  PieChart as RechartsPieChart,
  XAxis as RechartsXAxis,
  YAxis as RechartsYAxis,
} from "recharts";
import stackedBarSpec from "../../../packages/charts-spec/examples/velocity-stacked-bar.panel.json";
import type { PanelSpec } from "@axicharts/charts-spec";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const LATENCY = [42, 38, 55, 49, 62, 58, 71];
const P50 = [34, 31, 40, 38, 44, 41, 49];
const ERROR_RATE = [0.8, 0.6, 1.1, 0.9, 1.4, 1.0, 1.2];

const ROWS = DAYS.map((day, index) => ({
  day,
  p95: LATENCY[index]!,
  p50: P50[index]!,
  err: ERROR_RATE[index]!,
}));

const CARD: React.CSSProperties = {
  maxWidth: 520,
  border: "1px solid #e2e8f0",
  borderRadius: 10,
  background: "#ffffff",
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
  overflow: "hidden",
};

const HEADER: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "12px 16px",
  borderBottom: "1px solid #e2e8f0",
};

function KpiTile({ children }: { children: ReactElement }): ReactElement {
  return (
    <div
      style={{
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: 8,
        padding: "10px 12px",
        display: "grid",
        gap: 6,
      }}
    >
      {children}
    </div>
  );
}

function AxiSparkline({
  data,
  tone = "default",
}: {
  data: number[];
  tone?: "default" | "success" | "warning";
}): ReactElement {
  return (
    <ChartContainer theme={cleanTheme} height={36} width="100%">
      <LineChart
        categories={DAYS}
        series={[{ name: "trend", data, tone }]}
        fill
        showAxes={false}
      />
    </ChartContainer>
  );
}

function AxiCleanDefaultPanel(): ReactElement {
  return (
    <div style={CARD}>
      <div style={HEADER}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
          API p95 latency
        </span>
        <span
          style={{
            fontSize: 11,
            color: "#64748b",
            background: "#f1f5f9",
            borderRadius: 999,
            padding: "3px 8px",
          }}
        >
          Updated 2m ago
        </span>
      </div>
      <div style={{ padding: 16 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 10,
          }}
        >
          <KpiTile>
            <Stat value="71 ms" label="p95" surface="light" />
            <AxiSparkline data={LATENCY} tone="warning" />
          </KpiTile>
          <KpiTile>
            <Stat value="49 ms" label="p50" tone="success" surface="light" />
            <AxiSparkline data={P50} tone="success" />
          </KpiTile>
          <KpiTile>
            <Stat value="+4.1%" label="vs last week" tone="warning" surface="light" />
            <AxiSparkline data={ERROR_RATE} tone="default" />
          </KpiTile>
        </div>
        <div style={{ marginTop: 16 }}>
          <ChartContainer theme={cleanTheme} height={180} width="100%">
            <LineChart
              categories={DAYS}
              series={[{ name: "p95 latency", data: LATENCY }]}
              fill
              valueSuffix=" ms"
            />
          </ChartContainer>
          <p style={{ marginTop: 6, fontSize: 11, color: "#64748b" }}>
            Source: metrics · Mon–Sun · p95 latency (ms)
          </p>
        </div>
      </div>
    </div>
  );
}

function RechartsSparkline({
  dataKey,
  stroke,
}: {
  dataKey: "p95" | "p50" | "err";
  stroke: string;
}): ReactElement {
  return (
    <RechartsLineChart width={140} height={36} data={ROWS}>
      <Line
        type="monotone"
        dataKey={dataKey}
        stroke={stroke}
        strokeWidth={2}
        dot={false}
        isAnimationActive={false}
      />
    </RechartsLineChart>
  );
}

function RechartsBarePanel(): ReactElement {
  return (
    <div style={CARD}>
      <div style={{ ...HEADER, background: "#fafafa" }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>Recharts · default</span>
        <span style={{ fontSize: 11, color: "#64748b" }}>out of the box</span>
      </div>
      <div style={{ padding: 16 }}>
        <RechartsLineChart width={468} height={180} data={ROWS}>
          <RechartsXAxis dataKey="day" tick={{ fontSize: 11 }} />
          <RechartsYAxis tick={{ fontSize: 11 }} width={32} />
          <Line
            type="monotone"
            dataKey="p95"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </RechartsLineChart>
      </div>
    </div>
  );
}

function RechartsStyledPanel(): ReactElement {
  return (
    <div style={CARD}>
      <div style={HEADER}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
          API p95 latency
        </span>
        <span
          style={{
            fontSize: 11,
            color: "#64748b",
            background: "#f1f5f9",
            borderRadius: 999,
            padding: "3px 8px",
          }}
        >
          Updated 2m ago
        </span>
      </div>
      <div style={{ padding: 16 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 10,
          }}
        >
          <KpiTile>
            <div style={{ fontSize: 20, fontWeight: 600 }}>71 ms</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>p95</div>
            <RechartsSparkline dataKey="p95" stroke="#d97706" />
          </KpiTile>
          <KpiTile>
            <div style={{ fontSize: 20, fontWeight: 600, color: "#16a34a" }}>49 ms</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>p50</div>
            <RechartsSparkline dataKey="p50" stroke="#16a34a" />
          </KpiTile>
          <KpiTile>
            <div style={{ fontSize: 20, fontWeight: 600, color: "#d97706" }}>+4.1%</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>vs last week</div>
            <RechartsSparkline dataKey="err" stroke="#64748b" />
          </KpiTile>
        </div>
        <div style={{ marginTop: 16 }}>
          <AreaChart width={468} height={180} data={ROWS}>
            <defs>
              <linearGradient id="compareFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#e2e8f0" vertical={false} />
            <RechartsXAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={{ stroke: "#e2e8f0" }}
              tickLine={false}
            />
            <RechartsYAxis
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
              width={32}
            />
            <Area
              type="monotone"
              dataKey="p95"
              stroke="#2563eb"
              strokeWidth={2.25}
              fill="url(#compareFill)"
              isAnimationActive={false}
            />
          </AreaChart>
          <p style={{ marginTop: 6, fontSize: 11, color: "#64748b" }}>
            Source: metrics · Mon–Sun · p95 latency (ms)
          </p>
        </div>
      </div>
    </div>
  );
}

function SideBySideComparison(): ReactElement {
  return (
    <div style={{ display: "grid", gap: 24, maxWidth: 1080 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
          alignItems: "start",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: "#2563eb",
              marginBottom: 8,
            }}
          >
            AxiCharts · cleanTheme (C67)
          </div>
          <AxiCleanDefaultPanel />
        </div>
        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: "#64748b",
              marginBottom: 8,
            }}
          >
            Recharts · styled to match
          </div>
          <RechartsStyledPanel />
        </div>
      </div>
      <div>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: "#94a3b8",
            marginBottom: 8,
          }}
        >
          Recharts · default (no extra styling)
        </div>
        <RechartsBarePanel />
      </div>
    </div>
  );
}

const WEEKS = ["W1", "W2", "W3", "W4", "W5"];
const THROUGHPUT = [120, 90, 150, 110, 180];
const TARGET = 150;

const THROUGHPUT_ROWS = WEEKS.map((week, index) => ({
  week,
  throughput: THROUGHPUT[index]!,
  aboveTarget: THROUGHPUT[index]! >= TARGET,
}));

const SPRINT_ROWS = [
  { sprint: "S1", done: 22, carry: 6 },
  { sprint: "S2", done: 26, carry: 4 },
  { sprint: "S3", done: 24, carry: 5 },
  { sprint: "S4", done: 28, carry: 3 },
];

const BROWSER_SHARE_ROWS = [
  { name: "Chrome", value: 48 },
  { name: "Safari", value: 28 },
  { name: "Firefox", value: 14 },
  { name: "Other", value: 10 },
];

const DONUT_COLORS = ["#2563eb", "#16a34a", "#d97706", "#64748b"];

const COMPARE_LABEL: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  marginBottom: 8,
};

function GranularBarComparison(): ReactElement {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 20,
        maxWidth: 900,
      }}
    >
      <div>
        <div
          style={{
            ...COMPARE_LABEL,
            color: "#2563eb",
          }}
        >
          AxiCharts · Cell per category (C68)
        </div>
        <ChartContainer theme={cleanTheme} height={220} width="100%">
          <BarChart data={THROUGHPUT_ROWS} showValues valueSuffix=" req/min">
            <XAxis dataKey="week" />
            <YAxis />
            <Bar dataKey="throughput">
              {THROUGHPUT_ROWS.map((row) => (
                <Cell
                  key={row.week}
                  dataKey={row.week}
                  fill={row.aboveTarget ? "#16a34a" : "#d97706"}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>
      <div>
        <div
          style={{
            ...COMPARE_LABEL,
            color: "#64748b",
          }}
        >
          Recharts · Cell fill parity
        </div>
        <RechartsBarChart width={420} height={220} data={THROUGHPUT_ROWS}>
          <RechartsXAxis dataKey="week" tick={{ fontSize: 11 }} />
          <RechartsYAxis tick={{ fontSize: 11 }} width={32} />
          <RechartsBar dataKey="throughput" radius={[5, 5, 0, 0]}>
            {THROUGHPUT_ROWS.map((row) => (
              <RechartsCell
                key={row.week}
                fill={row.aboveTarget ? "#16a34a" : "#d97706"}
              />
            ))}
          </RechartsBar>
        </RechartsBarChart>
      </div>
    </div>
  );
}

function StackedBarComparison(): ReactElement {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 20,
        maxWidth: 900,
      }}
    >
      <div>
        <div style={{ ...COMPARE_LABEL, color: "#2563eb" }}>AxiCharts · stacked bar</div>
        <Chart panel={stackedBarSpec as PanelSpec} data={[]} />
      </div>
      <div>
        <div style={{ ...COMPARE_LABEL, color: "#64748b" }}>Recharts · stacked bar</div>
        <RechartsBarChart width={420} height={220} data={SPRINT_ROWS}>
          <RechartsXAxis dataKey="sprint" tick={{ fontSize: 11 }} />
          <RechartsYAxis tick={{ fontSize: 11 }} width={32} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <RechartsBar stackId="velocity" dataKey="done" fill="#16a34a" radius={[4, 4, 0, 0]} />
          <RechartsBar stackId="velocity" dataKey="carry" fill="#d97706" />
        </RechartsBarChart>
      </div>
    </div>
  );
}

function DonutComparison(): ReactElement {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 20,
        maxWidth: 900,
      }}
    >
      <div>
        <div style={{ ...COMPARE_LABEL, color: "#2563eb" }}>AxiCharts · donut</div>
        <ChartContainer theme={cleanTheme} height={220} width="100%">
          <PieChart
            innerRadius={60}
            slices={BROWSER_SHARE_ROWS.map((row) => ({
              name: row.name.toLowerCase(),
              value: row.value,
            }))}
          />
        </ChartContainer>
      </div>
      <div>
        <div style={{ ...COMPARE_LABEL, color: "#64748b" }}>Recharts · donut</div>
        <RechartsPieChart width={420} height={220}>
          <Pie
            data={BROWSER_SHARE_ROWS}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            isAnimationActive={false}
          >
            {BROWSER_SHARE_ROWS.map((row, index) => (
              <RechartsCell key={row.name} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
            ))}
          </Pie>
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </RechartsPieChart>
      </div>
    </div>
  );
}

const meta = {
  title: "Compare/Recharts vs AxiCharts",
  component: SideBySideComparison,
  parameters: {
    layout: "padded",
    backgrounds: { default: "dark" },
    docs: {
      description: {
        component:
          "Static side-by-side API comparisons. For the live ops wall stress demo (Standard / Heavy / Extreme presets, per-column Profiler timings), see **Compare → Live ops wall**.",
      },
    },
  },
} satisfies Meta<typeof SideBySideComparison>;

export default meta;
type Story = StoryObj<typeof meta>;

export const GranularBarCells: Story = {
  render: () => <GranularBarComparison />,
  parameters: {
    docs: {
      description: {
        story:
          "Per-category bar fills — AxiCharts Bar/Cell composable vs Recharts Bar/Cell (C73 parity).",
      },
    },
  },
};

export const CleanDefault: Story = {
  render: () => <SideBySideComparison />,
  parameters: {
    docs: {
      description: {
        story:
          "Same data and card dimensions — AxiCharts G · Clean Default vs Recharts default and a hand-styled Recharts match (grid, gradient fill, KPI strip).",
      },
    },
  },
};

export const StackedBar: Story = {
  render: () => <StackedBarComparison />,
  parameters: {
    docs: {
      description: {
        story:
          "Stacked bar — AxiCharts spec/compilePanel vs Recharts stacked Bar (C119 parity).",
      },
    },
  },
};

export const Donut: Story = {
  render: () => <DonutComparison />,
  parameters: {
    docs: {
      description: {
        story:
          "Donut — AxiCharts PieChart innerRadius vs Recharts Pie (C119 parity).",
      },
    },
  },
};
