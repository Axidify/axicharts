import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { BarChart, ChartContainer } from "@axicharts/charts";
import { cleanTheme } from "@axicharts/charts-theme";

const PRIORITY_ROWS = [
  { priority: "P1 – Critical", count: 12 },
  { priority: "P2 – High", count: 28 },
  { priority: "P3 – Medium", count: 45 },
  { priority: "P4 – Low", count: 19 },
];

const DEPARTMENTS = [
  "Engineering",
  "Customer Success",
  "Sales",
  "Marketing",
  "Finance",
  "Legal",
  "People Ops",
  "Security",
  "Infrastructure",
  "Data Science",
  "Product Design",
  "Partnerships",
  "Support",
  "Facilities",
];

const SPEND = DEPARTMENTS.map((_, index) => 40 + index * 11);

function HorizontalPriorityBars(): ReactElement {
  return (
    <ChartContainer theme={cleanTheme} height={260}>
      <BarChart
        orientation="horizontal"
        categories={PRIORITY_ROWS.map((row) => row.priority)}
        series={[{ name: "Tickets", data: PRIORITY_ROWS.map((row) => row.count) }]}
        showValues
      />
    </ChartContainer>
  );
}

function HorizontalHighCardinality(): ReactElement {
  return (
    <ChartContainer theme={cleanTheme} height={420}>
      <BarChart
        orientation="horizontal"
        categories={DEPARTMENTS}
        series={[{ name: "Spend", data: SPEND }]}
      />
    </ChartContainer>
  );
}

const meta = {
  title: "Charts/Horizontal bar",
  component: HorizontalPriorityBars,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Horizontal bar charts via `orientation=\"horizontal\"` on `BarChart` (uPlot scale ori/dir).",
      },
    },
  },
} satisfies Meta<typeof HorizontalPriorityBars>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PriorityBreakdown: Story = {
  render: () => <HorizontalPriorityBars />,
};

export const HighCardinality: Story = {
  render: () => <HorizontalHighCardinality />,
};
