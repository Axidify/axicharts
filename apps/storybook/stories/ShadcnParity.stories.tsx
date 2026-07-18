import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Chart, ejectPanel, type PanelSpec } from "@axicharts/charts-spec";
import { QuickLineChart } from "@axicharts/charts/quick";
import throughputSpec from "../../../packages/charts-spec/examples/throughput-bar-color.panel.json";
import areaSloSpec from "../../../packages/charts-spec/examples/area-slo-line.panel.json";
import revenueLineSpec from "../../../packages/charts-spec/examples/revenue-line.panel.json";
import revenueChartConfigSpec from "../../../packages/charts-spec/examples/revenue-line-chartconfig.panel.json";
import donutSpec from "../../../packages/charts-spec/examples/browser-share-donut.panel.json";
import stackedBarSpec from "../../../packages/charts-spec/examples/velocity-stacked-bar.panel.json";
import multiLineSpec from "../../../packages/charts-spec/examples/burndown-multi-line.panel.json";
import comboSpec from "../../../packages/charts-spec/examples/combo-revenue-bar-line.panel.json";
import {
  Bar,
  BarChart,
  Cell,
  ChartContainer,
  PieChart,
  XAxis,
  YAxis,
} from "@axicharts/charts";
import { cleanTheme } from "@axicharts/charts-theme";
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

const REVENUE_ROWS = [
  { day: "Mon", revenue: 4200 },
  { day: "Tue", revenue: 3800 },
  { day: "Wed", revenue: 5100 },
  { day: "Thu", revenue: 4600 },
  { day: "Fri", revenue: 5900 },
];

const BROWSER_SHARE_ROWS = [
  { name: "Chrome", value: 48 },
  { name: "Safari", value: 28 },
  { name: "Firefox", value: 14 },
  { name: "Other", value: 10 },
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

const DONUT_COLORS = ["#2563eb", "#16a34a", "#d97706", "#64748b"];

const TILE_LABEL: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  marginBottom: 8,
  color: "#64748b",
};

const GALLERY_GRID: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(280px, 1fr))",
  gap: 20,
  maxWidth: 720,
  padding: 20,
  background: "var(--chart-background, #f8fafc)",
  borderRadius: 12,
  border: "1px solid #e2e8f0",
};

function ShadcnParityGallery(): ReactElement {
  const barSpec = throughputSpec as PanelSpec;
  const areaSpec = areaSloSpec as PanelSpec;
  const ejected = ejectPanel(barSpec, "rows");

  return (
    <div style={{ display: "grid", gap: 28, maxWidth: 640 }}>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: "#64748b" }}>
          chartConfig — revenue line (revenue-line-chartconfig.panel.json)
        </div>
        <Chart panel={revenueChartConfigSpec as PanelSpec} data={REVENUE_ROWS} />
      </div>

      <div>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: "#64748b" }}>
          shadcn-style bar — spec JSON (encoding.color + props.style)
        </div>
        <Chart panel={barSpec} data={THROUGHPUT_ROWS} />
      </div>

      <div>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: "#64748b" }}>
          shadcn-style area — per-point SLO coloring
        </div>
        <Chart panel={areaSpec} data={LATENCY_ROWS} />
      </div>

      <div>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: "#64748b" }}>
          eject → Layer 1 JSX (Cell fills preserved)
        </div>
        <pre
          style={{
            fontSize: 10,
            lineHeight: 1.45,
            background: "#0f172a",
            color: "#e2e8f0",
            padding: 14,
            borderRadius: 10,
            overflow: "auto",
            maxHeight: 280,
          }}
        >
          {ejected}
        </pre>
      </div>
    </div>
  );
}

function ShadcnAdminGallery(): ReactElement {
  return (
    <div style={GALLERY_GRID}>
      <div>
        <div style={TILE_LABEL}>chartConfig — revenue line</div>
        <Chart panel={revenueChartConfigSpec as PanelSpec} data={REVENUE_ROWS} />
      </div>
      <div>
        <div style={TILE_LABEL}>Bar — encoding.color (spec)</div>
        <Chart panel={throughputSpec as PanelSpec} data={THROUGHPUT_ROWS} />
      </div>
      <div>
        <div style={TILE_LABEL}>Area — latency SLO</div>
        <Chart panel={areaSloSpec as PanelSpec} data={LATENCY_ROWS} />
      </div>
      <div>
        <div style={TILE_LABEL}>Line — revenue trend</div>
        <Chart panel={revenueLineSpec as PanelSpec} data={REVENUE_ROWS} />
      </div>
      <div>
        <div style={TILE_LABEL}>Donut — browser share (spec)</div>
        <Chart panel={donutSpec as PanelSpec} data={BROWSER_SHARE_ROWS} />
      </div>
      <div>
        <div style={TILE_LABEL}>Stacked bar — sprint velocity</div>
        <Chart panel={stackedBarSpec as PanelSpec} data={[]} />
      </div>
      <div>
        <div style={TILE_LABEL}>Multi-series line — burndown</div>
        <Chart panel={multiLineSpec as PanelSpec} data={[]} />
      </div>
      <div>
        <div style={TILE_LABEL}>Combo — bar + line (spec)</div>
        <Chart panel={comboSpec as PanelSpec} data={COMBO_ROWS} />
      </div>
      <div style={{ gridColumn: "1 / -1" }}>
        <div style={TILE_LABEL}>QuickLineChart — hello-world (C118)</div>
        <QuickLineChart
          title="Weekly revenue"
          labels={["Mon", "Tue", "Wed", "Thu", "Fri"]}
          data={[4200, 3800, 5100, 4600, 5900]}
          height={180}
        />
      </div>
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
        color: tone === "axi" ? "#2563eb" : "#64748b",
        marginBottom: 8,
      }}
    >
      {children}
    </div>
  );
}

function ParityRow({
  title,
  axi,
  recharts,
}: {
  title: string;
  axi: ReactElement;
  recharts: ReactElement;
}): ReactElement {
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: "#0f172a" }}>
        {title}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          alignItems: "start",
        }}
      >
        <div>
          <CompareColumnLabel tone="axi">AxiCharts</CompareColumnLabel>
          {axi}
        </div>
        <div>
          <CompareColumnLabel tone="recharts">Recharts</CompareColumnLabel>
          {recharts}
        </div>
      </div>
    </div>
  );
}

function RechartsParityWallGallery(): ReactElement {
  return (
    <div style={{ display: "grid", gap: 28, maxWidth: 960 }}>
      <ParityRow
        title="Multi-series bar — sprint velocity"
        axi={
          <ChartContainer theme={cleanTheme} height={220} width="100%">
            <BarChart
              categories={["S1", "S2", "S3", "S4"]}
              series={[
                { name: "Done", data: [22, 26, 24, 28] },
                { name: "Carry-over", data: [6, 4, 5, 3] },
              ]}
            />
          </ChartContainer>
        }
        recharts={
          <RechartsBarChart width={420} height={220} data={SPRINT_ROWS}>
            <RechartsXAxis dataKey="sprint" tick={{ fontSize: 11 }} />
            <RechartsYAxis tick={{ fontSize: 11 }} width={32} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <RechartsBar dataKey="done" fill="#2563eb" radius={[4, 4, 0, 0]} />
            <RechartsBar dataKey="carry" fill="#d97706" radius={[4, 4, 0, 0]} />
          </RechartsBarChart>
        }
      />

      <ParityRow
        title="Donut — browser share"
        axi={
          <ChartContainer theme={cleanTheme} height={220} width="100%">
            <PieChart
              innerRadius={60}
              slices={BROWSER_SHARE_ROWS.map((row) => ({
                name: row.name.toLowerCase(),
                value: row.value,
              }))}
            />
          </ChartContainer>
        }
        recharts={
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
        }
      />

      <ParityRow
        title="Stacked bar — sprint velocity"
        axi={
          <Chart panel={stackedBarSpec as PanelSpec} data={[]} />
        }
        recharts={
          <RechartsBarChart width={420} height={220} data={SPRINT_ROWS}>
            <RechartsXAxis dataKey="sprint" tick={{ fontSize: 11 }} />
            <RechartsYAxis tick={{ fontSize: 11 }} width={32} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <RechartsBar stackId="velocity" dataKey="done" fill="#16a34a" />
            <RechartsBar stackId="velocity" dataKey="carry" fill="#d97706" />
          </RechartsBarChart>
        }
      />

      <ParityRow
        title="Area — latency SLO coloring"
        axi={
          <Chart panel={areaSloSpec as PanelSpec} data={LATENCY_ROWS} />
        }
        recharts={
          <RechartsAreaChart width={420} height={220} data={LATENCY_ROWS}>
            <RechartsXAxis dataKey="day" tick={{ fontSize: 11 }} />
            <RechartsYAxis tick={{ fontSize: 11 }} width={32} />
            <Area
              type="monotone"
              dataKey="latency"
              stroke="#2563eb"
              fill="#2563eb"
              fillOpacity={0.2}
              isAnimationActive={false}
            >
              {LATENCY_ROWS.map((row) => (
                <RechartsCell
                  key={row.day}
                  fill={row.meets_slo ? "#16a34a" : "#d97706"}
                  stroke={row.meets_slo ? "#16a34a" : "#d97706"}
                />
              ))}
            </Area>
          </RechartsAreaChart>
        }
      />
    </div>
  );
}

const meta = {
  title: "Charts/ShadcnParity",
  component: ShadcnParityGallery,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "C119 shadcn Charts migration gallery — combo + QuickLineChart tiles, Recharts parity wall, custom registry (8 items) + CI E2E. Docs: /shadcn · /shadcn/registry",
      },
    },
  },
} satisfies Meta<typeof ShadcnParityGallery>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SpecAndEject: Story = {
  render: () => <ShadcnParityGallery />,
};

export const Gallery: Story = {
  render: () => <ShadcnAdminGallery />,
};

export const RechartsParityWall: Story = {
  render: () => <RechartsParityWallGallery />,
  parameters: {
    docs: {
      description: {
        story:
          "Side-by-side AxiCharts vs Recharts for multi-series bar, donut, stacked bar, and area SLO — same card styling as Compare/Recharts vs AxiCharts.",
      },
    },
  },
};
