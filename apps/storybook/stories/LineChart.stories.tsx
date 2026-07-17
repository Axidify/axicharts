import type { Meta, StoryObj } from "@storybook/react";
import { ChartContainer, LineChart } from "@axicharts/charts";
import { cleanTheme } from "@axicharts/charts-theme";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const LATENCY = [42, 38, 55, 49, 62, 58, 71];

const meta = {
  title: "Charts/LineChart",
  component: LineChart,
} satisfies Meta<typeof LineChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InContainer: Story = {
  parameters: {
    layout: "padded",
  },
  render: () => (
    <div
      style={{
        width: 480,
        padding: 24,
        background: "#f8fafc",
        borderRadius: 8,
      }}
    >
      <ChartContainer theme={cleanTheme} height={180}>
        <LineChart
          categories={DAYS}
          series={[{ name: "p95 latency", data: LATENCY }]}
          fill
          valueSuffix=" ms"
        />
      </ChartContainer>
    </div>
  ),
};
