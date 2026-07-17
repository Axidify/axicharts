import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ChartContainer, LineChart } from "@axicharts/charts";
import { cleanTheme } from "@axicharts/charts-theme";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const LATENCY = [42, 38, 55, 49, 62, 58, 71];
const ERRORS = [1, 2, 5, 3, 2, 4, 3];

function InteractionDemo(): ReactElement {
  return (
    <ChartContainer theme={cleanTheme} height={240} width={520}>
      <LineChart
        categories={DAYS}
        series={[
          { name: "p95 latency", data: LATENCY, tone: "info" },
          { name: "errors/min", data: ERRORS, tone: "warning" },
        ]}
        fill
        dualAxis="auto"
        valueSuffix=" ms"
      />
    </ChartContainer>
  );
}

const meta = {
  title: "Charts/Interaction",
  component: InteractionDemo,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "C2 interaction chrome — React tooltip, legend, and crosshair over uPlot. Hover the chart to inspect values.",
      },
    },
  },
} satisfies Meta<typeof InteractionDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DualSeriesHover: Story = {
  render: () => <InteractionDemo />,
};

export const LiveCrosshairOnly: Story = {
  render: () => (
    <ChartContainer theme={cleanTheme} mode="live" height={200} width={520}>
      <LineChart
        categories={DAYS}
        series={[{ name: "throughput", data: LATENCY }]}
        fill
      />
    </ChartContainer>
  ),
};

export const StaticNoChrome: Story = {
  render: () => (
    <ChartContainer theme={cleanTheme} mode="static" height={200} width={520}>
      <LineChart
        categories={DAYS}
        series={[{ name: "throughput", data: LATENCY }]}
        fill
      />
    </ChartContainer>
  ),
};
