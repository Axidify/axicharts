import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ChartContainer, RadarChart } from "@axicharts/charts";
import { cleanTheme } from "@axicharts/charts-theme";

const INDICATORS = [
  { name: "Reliability", max: 100 },
  { name: "Latency", max: 100 },
  { name: "Throughput", max: 100 },
  { name: "Cost", max: 100 },
  { name: "Security", max: 100 },
];

const SERIES = [
  {
    name: "Current",
    tone: "info" as const,
    values: [82, 74, 88, 63, 91],
  },
  {
    name: "Target",
    tone: "success" as const,
    values: [90, 85, 92, 75, 95],
  },
];

function RadarScorecard(): ReactElement {
  return (
    <div style={{ maxWidth: 520 }}>
      <ChartContainer theme={cleanTheme} height={360} width="100%">
        <RadarChart indicators={INDICATORS} series={SERIES} showLabels areaFill />
      </ChartContainer>
      <p style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
        C94 RadarChart — polar scorecard via ECharts adapter with composable ChartContainer shell
      </p>
    </div>
  );
}

const meta = {
  title: "Charts/Radar",
  component: RadarScorecard,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "C94 RadarChart + polar area — spec `type: radar` compile/eject and SaaS ops scorecard demo.",
      },
    },
  },
} satisfies Meta<typeof RadarScorecard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Scorecard: Story = {
  render: () => <RadarScorecard />,
};
