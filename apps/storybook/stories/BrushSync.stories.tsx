import type { Meta, StoryObj } from "@storybook/react";
import {
  AreaChart,
  BarChart,
  ChartContainer,
  ChartSyncGroup,
  LineChart,
} from "@axicharts/charts";
import { cleanTheme } from "@axicharts/charts-theme";

const CATEGORIES = Array.from({ length: 36 }, (_, index) => `T${index + 1}`);
const THROUGHPUT = CATEGORIES.map(
  (_, index) => 40 + Math.round(Math.sin(index / 3) * 18) + index,
);
const ERROR_RATE = CATEGORIES.map(
  (_, index) => 1.2 + Math.abs(Math.cos(index / 4)) * 2.5,
);
const LATENCY = CATEGORIES.map(
  (_, index) => 32 + Math.round(Math.sin(index / 5) * 12) + index * 0.4,
);

function OpsBrushDashboard() {
  return (
    <ChartSyncGroup>
      <div style={{ display: "grid", gap: 12, maxWidth: 720 }}>
        <ChartContainer theme={cleanTheme} height={220} syncId="throughput">
          <BarChart
            brush
            brushEnd={40}
            categories={CATEGORIES}
            series={[{ name: "Throughput", data: THROUGHPUT }]}
            showValues
          />
        </ChartContainer>
        <ChartContainer
          theme={cleanTheme}
          height={160}
          syncId="errors"
          syncFollower="throughput"
        >
          <LineChart
            categories={CATEGORIES}
            series={[{ name: "Error rate", data: ERROR_RATE, tone: "warning" }]}
            valueSuffix="%"
            fill
          />
        </ChartContainer>
        <ChartContainer
          theme={cleanTheme}
          height={160}
          syncId="latency"
          syncFollower="throughput"
        >
          <AreaChart
            categories={CATEGORIES}
            series={[{ name: "p95 latency", data: LATENCY, tone: "info" }]}
            valueSuffix="ms"
          />
        </ChartContainer>
      </div>
    </ChartSyncGroup>
  );
}

const meta = {
  title: "Charts/BrushSync",
  component: OpsBrushDashboard,
  parameters: {
    docs: {
      description: {
        component:
          "C92 ChartSyncGroup brush sync — bar leader publishes overview range; line and area followers slice via `syncFollower`. Multiple leaders last-wins; crosshair index maps into the brushed window.",
      },
    },
  },
} satisfies Meta<typeof OpsBrushDashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ThreePanelOps: Story = {
  render: () => <OpsBrushDashboard />,
};
