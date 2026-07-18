import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Chart, ejectPanel, type PanelSpec } from "@axicharts/charts-spec";
import { ChartContainer, PieChart } from "@axicharts/charts";
import { cleanTheme } from "@axicharts/charts-theme";
import throughputSpec from "../../../packages/charts-spec/examples/throughput-bar-color.panel.json";
import areaSloSpec from "../../../packages/charts-spec/examples/area-slo-line.panel.json";
import revenueLineSpec from "../../../packages/charts-spec/examples/revenue-line.panel.json";

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

const PIE_SLICES = [
  { name: "Chrome", value: 48 },
  { name: "Safari", value: 28 },
  { name: "Firefox", value: 14 },
  { name: "Other", value: 10 },
];

function ShadcnParityGallery(): ReactElement {
  const barSpec = throughputSpec as PanelSpec;
  const areaSpec = areaSloSpec as PanelSpec;
  const ejected = ejectPanel(barSpec, "rows");

  return (
    <div style={{ display: "grid", gap: 28, maxWidth: 640 }}>
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
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(280px, 1fr))",
        gap: 20,
        maxWidth: 720,
        padding: 20,
        background: "var(--chart-background, #f8fafc)",
        borderRadius: 12,
        border: "1px solid #e2e8f0",
      }}
    >
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 8, color: "#64748b" }}>
          Bar — throughput by week
        </div>
        <Chart panel={throughputSpec as PanelSpec} data={THROUGHPUT_ROWS} />
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 8, color: "#64748b" }}>
          Area — latency SLO
        </div>
        <Chart panel={areaSloSpec as PanelSpec} data={LATENCY_ROWS} />
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 8, color: "#64748b" }}>
          Line — revenue trend
        </div>
        <Chart panel={revenueLineSpec as PanelSpec} data={REVENUE_ROWS} />
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 8, color: "#64748b" }}>
          Donut — browser share
        </div>
        <ChartContainer theme={cleanTheme} height={200} width="100%">
          <PieChart slices={PIE_SLICES} innerRadius={42} showLabels />
        </ChartContainer>
      </div>
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
          "GTM-1 shadcn Charts migration gallery — spec examples compile without Recharts; eject preserves encoding.color as Cell JSX. Docs: /shadcn",
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
