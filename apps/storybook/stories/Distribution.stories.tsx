import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  BoxplotChart,
  ChartContainer,
  HistogramChart,
} from "@axicharts/charts";
import { cleanTheme } from "@axicharts/charts-theme";

const LATENCY_BOXES = [
  { category: "API", min: 12, q1: 28, median: 45, q3: 72, max: 140 },
  { category: "DB", min: 8, q1: 18, median: 32, q3: 58, max: 110 },
  { category: "Cache", min: 2, q1: 4, median: 7, q3: 12, max: 28 },
  { category: "Queue", min: 20, q1: 35, median: 52, q3: 88, max: 160 },
];

const LATENCY_BY_REGION = [
  {
    name: "US-East",
    tone: "info" as const,
    items: [
      { category: "API", min: 10, q1: 22, median: 38, q3: 60, max: 120 },
      { category: "DB", min: 6, q1: 14, median: 26, q3: 48, max: 95 },
    ],
  },
  {
    name: "EU-West",
    tone: "success" as const,
    items: [
      { category: "API", min: 14, q1: 30, median: 48, q3: 78, max: 150 },
      { category: "DB", min: 9, q1: 20, median: 36, q3: 62, max: 115 },
    ],
  },
];

const RESPONSE_HISTOGRAM = {
  categories: ["0–50", "50–100", "100–200", "200–400", "400–800", "800+"],
  values: [42, 118, 256, 189, 73, 22],
};

function LatencyBoxplot(): ReactElement {
  return (
    <div style={{ maxWidth: 520 }}>
      <ChartContainer theme={cleanTheme} height={320} width="100%">
        <BoxplotChart items={LATENCY_BOXES} valueSuffix=" ms" />
      </ChartContainer>
      <p style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
        Service latency percentiles — hover boxes for min/Q1/median/Q3/max
      </p>
    </div>
  );
}

function RegionalBoxplot(): ReactElement {
  return (
    <div style={{ maxWidth: 520 }}>
      <ChartContainer theme={cleanTheme} height={320} width="100%">
        <BoxplotChart series={LATENCY_BY_REGION} valueSuffix=" ms" />
      </ChartContainer>
      <p style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
        Multi-series boxplot with legend — grouped by region
      </p>
    </div>
  );
}

function ResponseHistogram(): ReactElement {
  return (
    <div style={{ maxWidth: 520 }}>
      <ChartContainer theme={cleanTheme} height={320} width="100%">
        <HistogramChart
          categories={RESPONSE_HISTOGRAM.categories}
          values={RESPONSE_HISTOGRAM.values}
          tone="info"
        />
      </ChartContainer>
      <p style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
        Pre-binned response-time histogram — hover bars for counts
      </p>
    </div>
  );
}

const meta = {
  title: "Charts/Distribution",
  component: LatencyBoxplot,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "C86 BoxplotChart + HistogramChart — distribution breadth via ECharts adapter.",
      },
    },
  },
} satisfies Meta<typeof LatencyBoxplot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Boxplot: Story = {
  render: () => <LatencyBoxplot />,
};

export const MultiSeriesBoxplot: Story = {
  render: () => <RegionalBoxplot />,
};

export const Histogram: Story = {
  render: () => <ResponseHistogram />,
};
