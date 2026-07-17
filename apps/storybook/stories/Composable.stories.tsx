import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  ChartContainer,
  Grid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "@axicharts/charts";
import { cleanTheme } from "@axicharts/charts-theme";

const DATA = [
  { date: "Mon", revenue: 4200, margin: 1200 },
  { date: "Tue", revenue: 3800, margin: 980 },
  { date: "Wed", revenue: 5100, margin: 1450 },
  { date: "Thu", revenue: 4600, margin: 1320 },
  { date: "Fri", revenue: 5400, margin: 1580 },
];

function ComposableRevenueChart(): ReactElement {
  return (
    <div style={{ maxWidth: 640 }}>
      <ChartContainer
        theme={cleanTheme}
        mode="interactive"
        height={320}
        width="100%"
        config={{
          revenue: { label: "Revenue", color: "var(--chart-1)" },
          margin: { label: "Margin", color: "var(--chart-2)" },
        }}
      >
        <LineChart data={DATA}>
          <Grid />
          <XAxis dataKey="date" />
          <YAxis tickFormat="currency" />
          <Tooltip />
          <Legend />
          <Line dataKey="revenue" />
          <Line dataKey="margin" tone="success" />
        </LineChart>
      </ChartContainer>
      <p style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
        RFC-002 composable API — Recharts-familiar children compile to categories + series.
      </p>
    </div>
  );
}

const meta = {
  title: "Charts/Composable",
  component: ComposableRevenueChart,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "RFC-002 phase 1 — declarative Line/Bar/Area/XAxis/YAxis marks on cartesian shells via data + children. See Charts/Composable ECharts for Pie/Funnel marks.",
      },
    },
  },
} satisfies Meta<typeof ComposableRevenueChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RevenueTrend: Story = {
  render: () => <ComposableRevenueChart />,
};
