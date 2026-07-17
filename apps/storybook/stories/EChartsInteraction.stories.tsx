import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  CandlestickChart,
  ChartContainer,
  PieChart,
  WaterfallChart,
} from "@axicharts/charts";
import { cleanTheme } from "@axicharts/charts-theme";

const CATEGORIES = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const OHLC = [
  { open: 102, high: 108, low: 101, close: 106 },
  { open: 106, high: 110, low: 104, close: 105 },
  { open: 105, high: 107, low: 99, close: 100 },
  { open: 100, high: 103, low: 98, close: 102 },
  { open: 102, high: 109, low: 101, close: 108 },
];
const VOLUME = [1.2, 1.5, 2.1, 1.8, 2.4];

const WATERFALL = [
  { name: "Revenue", value: 120 },
  { name: "COGS", value: -45 },
  { name: "Opex", value: -30 },
  { name: "EBITDA", value: 0, isTotal: true },
];

const SLICES = [
  { name: "Compute", value: 42, tone: "info" as const },
  { name: "Storage", value: 28, tone: "success" as const },
  { name: "Network", value: 18, tone: "warning" as const },
  { name: "Other", value: 12 },
];

const meta = {
  title: "Charts/ECharts Interaction",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "C2 unified React tooltips over ECharts — same chrome as uPlot cartesian charts.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const CandlestickHover: Story = {
  render: (): ReactElement => (
    <ChartContainer theme={cleanTheme} height={280} width={520}>
      <CandlestickChart
        categories={CATEGORIES}
        data={OHLC}
        volume={VOLUME}
      />
    </ChartContainer>
  ),
};

export const WaterfallHover: Story = {
  render: (): ReactElement => (
    <ChartContainer theme={cleanTheme} height={260} width={480}>
      <WaterfallChart items={WATERFALL} valueFormat="currency" />
    </ChartContainer>
  ),
};

export const PieHover: Story = {
  render: (): ReactElement => (
    <ChartContainer theme={cleanTheme} height={260} width={360}>
      <PieChart slices={SLICES} innerRadius={42} />
    </ChartContainer>
  ),
};
