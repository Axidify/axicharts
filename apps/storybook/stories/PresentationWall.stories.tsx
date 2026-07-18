import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  AreaChart,
  BarChart,
  ChartContainer,
  Gauge,
  HeatmapChart,
  LineChart,
  PieChart,
  Stat,
  WaterfallChart,
} from "@axicharts/charts";
import { presentationTheme } from "@axicharts/charts-theme";

const QUARTERS = ["Q1", "Q2", "Q3", "Q4"];
const REVENUE = [820, 932, 901, 1034];

function PresentationWall(): ReactElement {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: 16,
        maxWidth: 960,
        padding: 16,
        background: "#ffffff",
        borderRadius: 12,
        border: "1px solid #e2e8f0",
      }}
    >
      <ChartContainer theme={presentationTheme} mode="presentation" height={180}>
        <Stat value="62.4%" label="Gross margin" tone="success" surface="light" />
      </ChartContainer>
      <ChartContainer theme={presentationTheme} mode="presentation" height={180}>
        <Gauge value={78} label="SLO health" unit="%" tone="success" />
      </ChartContainer>
      <ChartContainer theme={presentationTheme} mode="presentation" height={220}>
        <LineChart
          categories={QUARTERS}
          series={[{ name: "Revenue", data: REVENUE, tone: "info" }]}
          fill
        />
      </ChartContainer>
      <ChartContainer theme={presentationTheme} mode="presentation" height={220}>
        <BarChart
          categories={QUARTERS}
          series={[{ name: "ARR", data: REVENUE }]}
          showValues
        />
      </ChartContainer>
      <ChartContainer theme={presentationTheme} mode="presentation" height={220}>
        <AreaChart
          categories={QUARTERS}
          series={[{ name: "Pipeline", data: REVENUE }]}
        />
      </ChartContainer>
      <ChartContainer theme={presentationTheme} mode="presentation" height={220}>
        <PieChart
          slices={[
            { name: "Enterprise", value: 58 },
            { name: "Mid-market", value: 27 },
            { name: "SMB", value: 15 },
          ]}
        />
      </ChartContainer>
      <ChartContainer theme={presentationTheme} mode="presentation" height={220}>
        <WaterfallChart
          items={[
            { name: "Q1", value: 820, isTotal: true },
            { name: "Expansion", value: 112 },
            { name: "Churn", value: -48, tone: "critical" },
            { name: "Q2", value: 932, isTotal: true },
          ]}
        />
      </ChartContainer>
      <ChartContainer theme={presentationTheme} mode="presentation" height={220}>
        <HeatmapChart
          matrix={{
            xCategories: ["Mon", "Tue", "Wed"],
            yCategories: ["US", "EU"],
            values: [
              [12, 18, 9],
              [8, 14, 11],
            ],
          }}
        />
      </ChartContainer>
    </div>
  );
}

const meta = {
  title: "Charts/Presentation wall",
  component: PresentationWall,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "C116 — multi-chart presentation wall with enter-fade on cartesian/ECharts tiles, Stat count-up, and Gauge arc choreography under mode=\"presentation\".",
      },
    },
  },
} satisfies Meta<typeof PresentationWall>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MultiChartWall: Story = {
  render: () => <PresentationWall />,
};
