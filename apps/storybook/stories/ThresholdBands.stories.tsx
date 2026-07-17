import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ChartContainer, LineChart } from "@axicharts/charts";
import { liveTheme } from "@axicharts/charts-theme";

const HOURS = ["06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00"];
const TEMP_C = [62, 68, 74, 79, 88, 76, 70];

function ThresholdBandsDemo(): ReactElement {
  return (
    <div style={{ maxWidth: 560 }}>
      <ChartContainer theme={liveTheme} mode="live" height={240} width="100%">
        <LineChart
          categories={HOURS}
          series={[{ name: "Reactor temp", data: TEMP_C, tone: "info" }]}
          valueSuffix=" °C"
          fill
          thresholdBands={[
            { min: 75, max: 85, label: "Warning", tone: "warning" },
            { min: 85, max: 100, label: "Critical", tone: "critical" },
          ]}
          referenceLines={[{ value: 75, label: "High limit", tone: "warning" }]}
        />
      </ChartContainer>
      <p style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
        C2 threshold bands + reference line — warn/crit zones behind the trend
      </p>
    </div>
  );
}

const meta = {
  title: "Chrome/Threshold Bands",
  component: ThresholdBandsDemo,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Horizontal threshold bands on cartesian charts — uPlot draw hook with semantic tones.",
      },
    },
  },
} satisfies Meta<typeof ThresholdBandsDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ReactorTemperature: Story = {
  render: () => <ThresholdBandsDemo />,
};
