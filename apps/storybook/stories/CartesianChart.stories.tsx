import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  ChartContainer,
  CartesianChart,
  Grid,
  XAxis,
  YAxis,
  Bar,
  Line,
  Area,
  Rule,
  Band,
} from "@axicharts/charts/cartesian";
import { studioTheme } from "@axicharts/charts-theme";
import { Chart } from "@axicharts/charts-spec";
import cartesianSpec from "../../../packages/charts-spec/examples/cartesian-revenue-target.panel.json";

const ROWS = [
  { week: "W1", revenue: 42, target: 40 },
  { week: "W2", revenue: 48, target: 44 },
  { week: "W3", revenue: 51, target: 48 },
  { week: "W4", revenue: 47, target: 50 },
  { week: "W5", revenue: 55, target: 52 },
  { week: "W6", revenue: 58, target: 54 },
];

function ComposableRevenueTarget(): ReactElement {
  return (
    <ChartContainer theme={studioTheme} mode="static" height={260} width="100%">
      <CartesianChart data={ROWS}>
        <Grid />
        <XAxis dataKey="week" />
        <YAxis />
        <Bar dataKey="revenue" name="Revenue" />
        <Line dataKey="target" name="Target" type="monotone" />
        <Rule value={50} label="Quota" tone="warning" />
        <Band min={44} max={52} label="Healthy band" tone="success" />
      </CartesianChart>
    </ChartContainer>
  );
}

function ComposableMultiCurve(): ReactElement {
  return (
    <ChartContainer theme={studioTheme} mode="static" height={240} width="100%">
      <CartesianChart data={ROWS}>
        <XAxis dataKey="week" />
        <YAxis />
        <Line dataKey="revenue" name="Revenue" type="linear" />
        <Line dataKey="target" name="Target" type="monotone" />
      </CartesianChart>
    </ChartContainer>
  );
}

function ComposableBarAreaMix(): ReactElement {
  return (
    <ChartContainer theme={studioTheme} mode="static" height={240} width="100%">
      <CartesianChart data={ROWS}>
        <XAxis dataKey="week" />
        <YAxis />
        <Bar dataKey="revenue" name="Revenue" />
        <Area dataKey="target" name="Target" />
      </CartesianChart>
    </ChartContainer>
  );
}

function SpecPanel(): ReactElement {
  return (
    <div style={{ maxWidth: 720 }}>
      <Chart panel={cartesianSpec} data={ROWS} />
    </div>
  );
}

function CartesianWall(): ReactElement {
  return (
    <div style={{ display: "grid", gap: 28, maxWidth: 1080 }}>
      <section>
        <h2 style={{ margin: "0 0 8px", fontSize: 16 }}>Composable CartesianChart</h2>
        <ComposableRevenueTarget />
      </section>
      <section>
        <h2 style={{ margin: "0 0 8px", fontSize: 16 }}>Per-mark curve (S23)</h2>
        <ComposableMultiCurve />
      </section>
      <section>
        <h2 style={{ margin: "0 0 8px", fontSize: 16 }}>Bar + area mix (S08)</h2>
        <ComposableBarAreaMix />
      </section>
      <section>
        <h2 style={{ margin: "0 0 8px", fontSize: 16 }}>Spec-driven panel</h2>
        <SpecPanel />
      </section>
    </div>
  );
}

const meta = {
  title: "Charts/Cartesian",
  component: CartesianWall,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "C137 — public `CartesianChart` composable shell with bar/line/area data marks and rule/band overlays.",
      },
    },
  },
} satisfies Meta<typeof CartesianWall>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Wall: Story = {
  render: () => <CartesianWall />,
};

export const Composable: Story = {
  render: () => <ComposableRevenueTarget />,
};

export const SpecDriven: Story = {
  render: () => <SpecPanel />,
};
