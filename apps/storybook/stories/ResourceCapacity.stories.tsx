import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  BarChart,
  ChartContainer,
  Gauge,
  PieChart,
  Stat,
} from "@axicharts/charts";
import { cleanTheme } from "@axicharts/charts-theme";

function ResourceCapacityMockup(): ReactElement {
  return (
    <div
      style={{
        maxWidth: 720,
        border: "1px solid #e2e8f0",
        borderRadius: 8,
        background: "#ffffff",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
          Cloud capacity · us-east-1
        </span>
        <span style={{ fontSize: 12, color: "#64748b" }}>Resource management</span>
      </div>

      <div style={{ padding: 16 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 12,
          }}
        >
          <Stat value="78%" label="CPU pool" tone="warning" surface="light" />
          <Stat value="64%" label="Memory" tone="success" surface="light" />
          <Stat value="12" label="Pending jobs" surface="light" />
        </div>

        <div
          style={{
            marginTop: 16,
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 16,
          }}
        >
          <Gauge value={78} label="Compute" unit="%" warningAt={70} criticalAt={90} />
          <Gauge value={64} label="Storage" unit="%" warningAt={75} criticalAt={92} />
          <Gauge value={41} label="Network" unit="%" warningAt={80} criticalAt={95} />
        </div>

        <div
          style={{
            marginTop: 16,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
          }}
        >
          <ChartContainer theme={cleanTheme} height={220} width="100%">
            <PieChart
              showLabels
              slices={[
                { name: "Production", value: 48, tone: "info" },
                { name: "Staging", value: 22, tone: "default" },
                { name: "Analytics", value: 18, tone: "success" },
                { name: "Idle", value: 12, tone: "warning" },
              ]}
            />
          </ChartContainer>

          <ChartContainer theme={cleanTheme} height={220} width="100%">
            <BarChart
              categories={["Mon", "Tue", "Wed", "Thu", "Fri"]}
              series={[{ name: "vCPU hours", data: [420, 510, 480, 620, 580] }]}
              showValues
              valueSuffix=" h"
            />
          </ChartContainer>
        </div>
      </div>
    </div>
  );
}

const meta = {
  title: "Mockups/O · Resource Capacity",
  component: ResourceCapacityMockup,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Resource management vertical — utilization gauges, allocation pie, weekly bar usage.",
      },
    },
  },
} satisfies Meta<typeof ResourceCapacityMockup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CapacityWall: Story = {
  render: () => <ResourceCapacityMockup />,
};
