import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  ChartContainer,
  ChartSyncGroup,
  LineChart,
} from "@axicharts/charts";
import { cleanTheme } from "@axicharts/charts-theme";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const LATENCY = [42, 38, 55, 49, 62, 58, 71];
const ERRORS = [1, 2, 5, 3, 2, 4, 3];

function SyncedPanelsDemo(): ReactElement {
  return (
    <ChartSyncGroup>
      <div style={{ display: "grid", gap: 12, maxWidth: 520 }}>
        <ChartContainer theme={cleanTheme} syncId="latency" height={180} width="100%">
          <LineChart
            categories={DAYS}
            series={[{ name: "p95 latency", data: LATENCY, tone: "info" }]}
            fill
          />
        </ChartContainer>
        <ChartContainer theme={cleanTheme} syncId="errors" height={140} width="100%">
          <LineChart
            categories={DAYS}
            series={[{ name: "errors/min", data: ERRORS, tone: "warning" }]}
            fill
          />
        </ChartContainer>
      </div>
    </ChartSyncGroup>
  );
}

const meta = {
  title: "Charts/Synced Crosshair",
  component: SyncedPanelsDemo,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "C4 synced crosshair — hover either panel to align the category index across charts in a ChartSyncGroup. Follower panels dim non-active bands and show a sync highlight.",
      },
    },
  },
} satisfies Meta<typeof SyncedPanelsDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DualPanel: Story = {
  render: () => <SyncedPanelsDemo />,
};
