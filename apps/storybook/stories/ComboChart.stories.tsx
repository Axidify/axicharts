import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  ChartContainer,
  ComboChart,
  type ComboSeries,
} from "@axicharts/charts";
import { Chart } from "@axicharts/charts-spec";
import { cleanTheme } from "@axicharts/charts-theme";

const WEEKS = ["W1", "W2", "W3", "W4", "W5"];
const WEEKLY_TOTALS = [120, 90, 150, 110, 180];
const DAILY_AVG = [17, 13, 21, 16, 26];

const SERIES: ComboSeries[] = [
  { name: "Weekly total", kind: "bar", data: WEEKLY_TOTALS, tone: "info" },
  { name: "Daily avg", kind: "line", data: DAILY_AVG, tone: "success" },
];

function ComboChartDemo(): ReactElement {
  return (
    <ChartContainer theme={cleanTheme} height={280} width="100%">
      <ComboChart
        categories={WEEKS}
        series={SERIES}
        showValues
        fill
        referenceLines={[
          { value: 150, label: "Target", tone: "warning" },
        ]}
      />
    </ChartContainer>
  );
}

const meta = {
  title: "Charts/ComboChart",
  component: ComboChartDemo,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Mixed line + bar on one cartesian shell (uPlot). Replaces stacked separate LineChart + BarChart for gate K-style KPI combos.",
      },
    },
  },
} satisfies Meta<typeof ComboChartDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LineAndBar: Story = {
  render: () => <ComboChartDemo />,
};

function ComboSpecDemo(): ReactElement {
  return (
    <Chart
      panel={{
        type: "combo",
        title: "Weekly throughput",
        encoding: {
          x: { field: "week" },
          y: [
            { field: "total", label: "Weekly total", kind: "bar" },
            { field: "avg", label: "Daily avg", kind: "line" },
          ],
        },
        props: { dualAxis: "auto", showValues: true },
        height: 280,
      }}
      data={WEEKS.map((week, index) => ({
        week,
        total: WEEKLY_TOTALS[index],
        avg: DAILY_AVG[index],
      }))}
      theme="clean"
    />
  );
}

export const SpecCompile: Story = {
  render: () => <ComboSpecDemo />,
};

export const DualAxis: Story = {
  render: () => (
    <ChartContainer theme={cleanTheme} height={280} width="100%">
      <ComboChart
        categories={WEEKS}
        series={SERIES}
        dualAxis="auto"
        fill
      />
    </ChartContainer>
  ),
};
