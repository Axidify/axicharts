import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  ChartContainer,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from "@axicharts/charts";
import { cleanTheme } from "@axicharts/charts-theme";

const TREND_DATA = [
  { date: "Mon", latency: 42, throughput: 1200 },
  { date: "Tue", latency: 38, throughput: 1320 },
  { date: "Wed", latency: 55, throughput: 1010 },
  { date: "Thu", latency: 49, throughput: 1460 },
  { date: "Fri", latency: 62, throughput: 1580 },
];

const MIX_DATA = [
  { name: "Product", value: 48 },
  { name: "Services", value: 28 },
  { name: "Support", value: 14 },
];

const chartConfig = {
  latency: { label: "p95 latency", color: "hsl(var(--chart-1))" },
  throughput: { label: "Throughput", color: "hsl(var(--chart-2))" },
  Product: { label: "Product", color: "hsl(var(--chart-1))" },
  Services: { label: "Services", color: "hsl(var(--chart-2))" },
  Support: { label: "Support", color: "hsl(var(--chart-3))" },
} as const;

function ChartConfigDemo(): ReactElement {
  return (
    <div style={{ display: "grid", gap: 24, maxWidth: 720 }}>
      <ChartContainer
        theme={cleanTheme}
        mode="interactive"
        height={280}
        width="100%"
        config={chartConfig}
      >
        <LineChart data={TREND_DATA}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line dataKey="latency" />
          <Line dataKey="throughput" />
        </LineChart>
      </ChartContainer>

      <ChartContainer
        theme={cleanTheme}
        mode="interactive"
        height={240}
        width={360}
        config={chartConfig}
      >
        <PieChart data={MIX_DATA}>
          <Pie dataKey="value" nameKey="name" innerRadius={42} showLabels />
          <Tooltip />
        </PieChart>
      </ChartContainer>
    </div>
  );
}

const meta = {
  title: "Charts/ChartConfig",
  component: ChartConfigDemo,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "shadcn-compatible chartConfig — labels and colors flow to cartesian strokes, legend, tooltip, and ECharts slices.",
      },
    },
  },
} satisfies Meta<typeof ChartConfigDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TokensAndLabels: Story = {
  render: () => <ChartConfigDemo />,
};
