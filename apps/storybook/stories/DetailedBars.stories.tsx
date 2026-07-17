import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { BarChart, ChartContainer, Stat } from "@axicharts/charts";
import { cleanTheme } from "@axicharts/charts-theme";

const WEEKS = ["W1", "W2", "W3", "W4", "W5"];
const THROUGHPUT = [120, 90, 150, 110, 180];
const TARGET = 150;

function DetailedBarsMockup(): ReactElement {
  const peak = Math.max(...THROUGHPUT);

  return (
    <div style={{ maxWidth: 480 }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 20,
          marginBottom: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 26, lineHeight: 1.1, fontWeight: 600 }}>
            {peak} req/min
          </div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
            Peak throughput · W5
          </div>
        </div>
        <Stat value="+18%" label="vs W4" tone="success" />
      </div>

      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
        Weekly throughput
      </div>
      <ChartContainer theme={cleanTheme} height={220} width="100%">
        <BarChart
          categories={WEEKS}
          series={[{ name: "Throughput", data: THROUGHPUT }]}
          showValues
          valueSuffix=" req/min"
          referenceLines={[{ value: TARGET, label: "Target", tone: "warning" }]}
        />
      </ChartContainer>
      <p style={{ marginTop: 6, fontSize: 11, color: "#64748b" }}>
        Source: gateway · W1–W5 · Y: req/min, X: week · single-hue bars, value
        labels, target line
      </p>
    </div>
  );
}

const meta = {
  title: "Mockups/I · Detailed Bars",
  component: DetailedBarsMockup,
  parameters: {
    docs: {
      description: {
        component:
          "Round 2 acceptance target — single-hue bars, showValues, referenceLines target, hero KPI strip.",
      },
    },
  },
} satisfies Meta<typeof DetailedBarsMockup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WeeklyThroughput: Story = {
  render: () => <DetailedBarsMockup />,
};
