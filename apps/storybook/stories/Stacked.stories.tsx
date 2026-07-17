import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  AreaChart,
  BarChart,
  ChartContainer,
  LineChart,
} from "@axicharts/charts";
import { cleanTheme } from "@axicharts/charts-theme";

const QUARTERS = ["Q1", "Q2", "Q3", "Q4"];
const PRODUCT = [420, 480, 510, 560];
const SERVICES = [180, 210, 240, 290];
const SUPPORT = [90, 95, 110, 120];

function StackedChartsDemo(): ReactElement {
  return (
    <div style={{ display: "grid", gap: 20, maxWidth: 560 }}>
      <div>
        <p style={{ margin: "0 0 8px", fontSize: 12, color: "#64748b" }}>
          Stacked line — cumulative trend
        </p>
        <ChartContainer theme={cleanTheme} height={180} width="100%">
          <LineChart
            categories={QUARTERS}
            stacked
            fill
            series={[
              { name: "Product", data: PRODUCT, tone: "info" },
              { name: "Services", data: SERVICES, tone: "success" },
              { name: "Support", data: SUPPORT, tone: "warning" },
            ]}
          />
        </ChartContainer>
      </div>

      <div>
        <p style={{ margin: "0 0 8px", fontSize: 12, color: "#64748b" }}>
          Stacked bar — revenue by line
        </p>
        <ChartContainer theme={cleanTheme} height={220} width="100%">
          <BarChart
            categories={QUARTERS}
            stacked
            series={[
              { name: "Product", data: PRODUCT, tone: "info" },
              { name: "Services", data: SERVICES, tone: "success" },
              { name: "Support", data: SUPPORT, tone: "warning" },
            ]}
          />
        </ChartContainer>
      </div>

      <div>
        <p style={{ margin: "0 0 8px", fontSize: 12, color: "#64748b" }}>
          Stacked area — same breakdown
        </p>
        <ChartContainer theme={cleanTheme} height={200} width="100%">
          <AreaChart
            categories={QUARTERS}
            stacked
            series={[
              { name: "Product", data: PRODUCT, tone: "info" },
              { name: "Services", data: SERVICES, tone: "success" },
              { name: "Support", data: SUPPORT, tone: "warning" },
            ]}
          />
        </ChartContainer>
      </div>
    </div>
  );
}

const meta = {
  title: "Charts/Stacked",
  component: StackedChartsDemo,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "C2 stacked cartesian charts — pass stacked to LineChart, BarChart, or AreaChart with aligned multi-series data.",
      },
    },
  },
} satisfies Meta<typeof StackedChartsDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RevenueBreakdown: Story = {
  render: () => <StackedChartsDemo />,
};
