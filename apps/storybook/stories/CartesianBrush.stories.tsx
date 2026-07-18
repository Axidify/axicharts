import type { Meta, StoryObj } from "@storybook/react";
import {
  BarChart,
  ChartContainer,
  ChartSyncGroup,
  LineChart,
} from "@axicharts/charts";
import { cleanTheme } from "@axicharts/charts-theme";

const CATEGORIES = Array.from({ length: 24 }, (_, index) => `T${index + 1}`);
const THROUGHPUT = CATEGORIES.map((_, index) => 40 + Math.round(Math.sin(index / 3) * 18) + index);
const ERROR_RATE = CATEGORIES.map((_, index) => 1.2 + Math.abs(Math.cos(index / 4)) * 2.5);

function CartesianBrushDemo() {
  return (
    <ChartSyncGroup>
      <div style={{ display: "grid", gap: 12 }}>
        <ChartContainer theme={cleanTheme} height={220} syncId="throughput">
          <BarChart
            brush
            brushEnd={50}
            categories={CATEGORIES}
            series={[{ name: "Throughput", data: THROUGHPUT }]}
            showValues
          />
        </ChartContainer>
        <ChartContainer theme={cleanTheme} height={160} syncId="errors">
          <LineChart
            categories={CATEGORIES}
            series={[{ name: "Error rate", data: ERROR_RATE, tone: "warning" }]}
            valueSuffix="%"
            fill
          />
        </ChartContainer>
      </div>
    </ChartSyncGroup>
  );
}

const meta = {
  title: "Charts/CartesianBrush",
  component: CartesianBrushDemo,
  parameters: {
    docs: {
      description: {
        component:
          "C83 cartesian brush — uPlot overview strip on line/bar leaders publishes range to ChartSyncGroup; follower panels slice to the same window.",
      },
    },
  },
} satisfies Meta<typeof CartesianBrushDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LeaderAndFollower: Story = {
  render: () => <CartesianBrushDemo />,
};
