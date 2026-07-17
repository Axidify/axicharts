import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Chart,
  Dashboard,
  ejectPanel,
  planPanelsFromProfile,
  suggestTemplate,
} from "@axicharts/charts-spec";

const REVENUE_ROWS = [
  { day: "Mon", value: 120 },
  { day: "Tue", value: 90 },
  { day: "Wed", value: 150 },
  { day: "Thu", value: 110 },
];

function SpecLinePanel(): ReactElement {
  return (
    <Chart
      panel={{
        type: "line",
        encoding: {
          x: { field: "day", type: "nominal" },
          y: { field: "value", type: "quantitative" },
        },
        fill: true,
        height: 200,
      }}
      data={REVENUE_ROWS}
    />
  );
}

const meta = {
  title: "Spec/Layer 2",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "C3 @axicharts/charts-spec — compile panel JSON to Layer 1 charts, vertical templates, and eject-to-JSX.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const LineFromSpec: Story = {
  render: () => <SpecLinePanel />,
};

export const FinancePnlTemplate: Story = {
  render: () => (
    <Dashboard
      template="finance-pnl"
      title="Q2 P&L bridge"
      subtitle="USD · FY26"
      data={{
        kpis: [
          { value: "$1.33M", label: "Net revenue" },
          { value: "62.4%", label: "Gross margin", tone: "success" },
          { value: "+18%", label: "QoQ growth" },
        ],
        waterfall: [
          { name: "Q1", value: 1100000, isTotal: true },
          { name: "New ARR", value: 240000 },
          { name: "Churn", value: -80000, tone: "critical" },
          { name: "Q2", value: 1330000, isTotal: true },
        ],
        categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        revenue: [820, 932, 901, 1034, 1290, 1330],
      }}
    />
  ),
};

export const Ops2x2Template: Story = {
  render: () => (
    <Dashboard
      template="ops-2x2"
      theme="industrial"
      mode="live"
      data={{
        categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        cells: [
          { title: "CPU", data: [22, 28, 31, 34, 30, 34, 32], suffix: "%" },
          { title: "Memory", data: [55, 58, 60, 59, 61, 62, 61], suffix: "%" },
          {
            title: "Errors",
            data: [1, 2, 5, 3, 2, 4, 3],
            suffix: "/min",
            tone: "warning",
          },
          { title: "p95", data: [42, 38, 55, 49, 62, 58, 71], suffix: "ms" },
        ],
      }}
    />
  ),
};

export const ProfilePlanner: Story = {
  render: () => {
    const profile = {
      metrics: [
        {
          name: "revenue",
          tags: { vertical: "finance" },
        },
        {
          name: "margin",
          tags: { vertical: "finance" },
        },
      ],
    };
    const template = suggestTemplate(profile);
    const panels = planPanelsFromProfile(profile);
    const ejected = ejectPanel(panels[0]!);

    return (
      <div style={{ maxWidth: 560, fontSize: 12 }}>
        <p>
          Suggested template: <code>{template}</code>
        </p>
        <p>Planned panels: {panels.map((panel) => panel.type).join(", ")}</p>
        <pre
          style={{
            marginTop: 12,
            padding: 12,
            background: "#f8fafc",
            borderRadius: 6,
            overflow: "auto",
            fontSize: 11,
          }}
        >
          {ejected}
        </pre>
      </div>
    );
  },
};
