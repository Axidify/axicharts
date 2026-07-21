import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ChartContainer, PieChart } from "@axicharts/charts";
import { cleanTheme } from "@axicharts/charts-theme";

const STATUS_SLICES = [
  { name: "Open", value: 12, tone: "warning" as const },
  { name: "In progress", value: 8, tone: "info" as const },
  { name: "Done", value: 24, tone: "success" as const },
];

const meta = {
  title: "Charts/Pie",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Full pie (no hole) — compact tiles use bottom legend; same `PieChart` as donut without `innerRadius`.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const StatusDistribution: Story = {
  render: (): ReactElement => (
    <ChartContainer theme={cleanTheme} mode="static" height={280} width={360}>
      <PieChart slices={STATUS_SLICES} showLabels />
    </ChartContainer>
  ),
};
