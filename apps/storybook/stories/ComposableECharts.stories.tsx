import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Cell,
  ChartContainer,
  Funnel,
  FunnelChart,
  Legend,
  Pie,
  PieChart,
  Tooltip,
} from "@axicharts/charts";
import { cleanTheme } from "@axicharts/charts-theme";

const MIX_DATA = [
  { name: "Product", value: 48 },
  { name: "Services", value: 28 },
  { name: "Support", value: 14 },
  { name: "Other", value: 10 },
];

const FUNNEL_DATA = [
  { stage: "Visitors", count: 12000 },
  { stage: "Signups", count: 4200 },
  { stage: "Trials", count: 1800 },
  { stage: "Paid", count: 620 },
];

function ComposableDonutChart(): ReactElement {
  return (
    <div style={{ maxWidth: 360 }}>
      <ChartContainer
        theme={cleanTheme}
        mode="interactive"
        height={280}
        width="100%"
        config={{
          Product: { label: "Product" },
          Services: { label: "Services" },
          Support: { label: "Support" },
          Other: { label: "Other" },
        }}
      >
        <PieChart data={MIX_DATA}>
          <Pie dataKey="value" nameKey="name" innerRadius={42} showLabels>
            <Cell dataKey="Support" tone="warning" />
            <Cell dataKey="Other" tone="critical" />
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ChartContainer>
    </div>
  );
}

function ComposableFunnelChart(): ReactElement {
  return (
    <div style={{ maxWidth: 420 }}>
      <ChartContainer theme={cleanTheme} mode="interactive" height={320} width="100%">
        <FunnelChart data={FUNNEL_DATA}>
          <Funnel dataKey="count" nameKey="stage" sort="descending" />
          <Tooltip />
        </FunnelChart>
      </ChartContainer>
    </div>
  );
}

const meta = {
  title: "Charts/Composable ECharts",
  component: ComposableDonutChart,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "RFC-002 phase 2 — Pie/Cell/Funnel marks on ECharts shells via data + children.",
      },
    },
  },
} satisfies Meta<typeof ComposableDonutChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DonutMix: Story = {
  render: () => <ComposableDonutChart />,
};

export const PipelineFunnel: Story = {
  render: () => <ComposableFunnelChart />,
};
