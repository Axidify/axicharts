import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Bar,
  BarChart,
  ChartContainer,
  XAxis,
  YAxis,
} from "@axicharts/charts";
import { Chart } from "@axicharts/charts-spec";
import { cleanTheme } from "@axicharts/charts-theme";
import type { PanelSpec } from "@axicharts/charts-spec";
import {
  Bar as RechartsBar,
  BarChart as RechartsBarChart,
  Cell as RechartsCell,
  XAxis as RechartsXAxis,
  YAxis as RechartsYAxis,
} from "recharts";

const PRIORITY_ROWS = [
  { priority: "P1 – Critical", count: 12 },
  { priority: "P2 – High", count: 28 },
  { priority: "P3 – Medium", count: 45 },
  { priority: "P4 – Low", count: 19 },
];

const PRIORITY_COLORS: Record<string, string> = {
  "P1 – Critical": "#f43f5e",
  "P2 – High": "#f59e0b",
  "P3 – Medium": "#3b82f6",
  "P4 – Low": "#64748b",
};

const PRIORITY_PANEL: PanelSpec = {
  specVersion: 1,
  type: "cartesian",
  title: "Tickets by priority",
  theme: "clean",
  mode: "interactive",
  encoding: {
    x: { field: "priority", type: "nominal" },
    color: { field: "priority", type: "nominal" },
  },
  marks: [{ type: "bar", field: "count", label: "Tickets" }],
};

const CARD: React.CSSProperties = {
  maxWidth: 480,
  border: "1px solid #e2e8f0",
  borderRadius: 10,
  background: "#ffffff",
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
  overflow: "hidden",
};

const LABEL: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  marginBottom: 8,
};

function CompositionPriorityCompare(): ReactElement {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 20,
        maxWidth: 1000,
        padding: 8,
      }}
    >
      <div>
        <div style={{ ...LABEL, color: "#2563eb" }}>
          AxiCharts · nominal priority colors (spec path)
        </div>
        <div style={CARD}>
          <div style={{ padding: 16 }}>
            <Chart panel={PRIORITY_PANEL} data={PRIORITY_ROWS} />
          </div>
        </div>
      </div>
      <div>
        <div style={{ ...LABEL, color: "#64748b" }}>
          Recharts · horizontal bar reference
        </div>
        <div style={CARD}>
          <div style={{ padding: 16 }}>
            <RechartsBarChart
              width={420}
              height={220}
              data={PRIORITY_ROWS}
              layout="vertical"
              margin={{ left: 96 }}
            >
              <RechartsXAxis type="number" tick={{ fontSize: 11 }} />
              <RechartsYAxis
                type="category"
                dataKey="priority"
                tick={{ fontSize: 11 }}
                width={92}
              />
              <RechartsBar dataKey="count" radius={[0, 4, 4, 0]}>
                {PRIORITY_ROWS.map((row) => (
                  <RechartsCell
                    key={row.priority}
                    fill={PRIORITY_COLORS[row.priority]}
                  />
                ))}
              </RechartsBar>
            </RechartsBarChart>
          </div>
        </div>
      </div>
      <div style={{ gridColumn: "1 / -1" }}>
        <div style={{ ...LABEL, color: "#2563eb" }}>
          AxiCharts · horizontal bar (spec path)
        </div>
        <div style={CARD}>
          <div style={{ padding: 16 }}>
            <Chart
              panel={{
                ...PRIORITY_PANEL,
                orientation: "horizontal",
                height: 260,
              }}
              data={PRIORITY_ROWS}
            />
          </div>
        </div>
      </div>
      <div style={{ gridColumn: "1 / -1" }}>
        <div style={{ ...LABEL, color: "#2563eb" }}>
          AxiCharts · imperative BarChart + chartConfig
        </div>
        <div style={CARD}>
          <div style={{ padding: 16 }}>
            <ChartContainer
              theme={cleanTheme}
              height={220}
              config={{
                "P1 – Critical": { color: PRIORITY_COLORS["P1 – Critical"] },
                "P2 – High": { color: PRIORITY_COLORS["P2 – High"] },
                "P3 – Medium": { color: PRIORITY_COLORS["P3 – Medium"] },
                "P4 – Low": { color: PRIORITY_COLORS["P4 – Low"] },
              }}
            >
              <BarChart data={PRIORITY_ROWS}>
                <XAxis dataKey="priority" />
                <YAxis />
                <Bar dataKey="count" />
              </BarChart>
            </ChartContainer>
          </div>
        </div>
        <p style={{ marginTop: 8, fontSize: 11, color: "#64748b" }}>
          Horizontal bars via <code>orientation="horizontal"</code> on panel spec
          or <code>BarChart</code> — see Charts/Horizontal bar.
        </p>
      </div>
    </div>
  );
}

const meta = {
  title: "Compare/Composition priority",
  component: CompositionPriorityCompare,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Priority/composition bar parity — AxiCharts nominal color encoding vs Recharts semantic Cell fills. Repro for C147 dashboard feedback.",
      },
    },
  },
} satisfies Meta<typeof CompositionPriorityCompare>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PriorityBreakdown: Story = {
  render: () => <CompositionPriorityCompare />,
};
