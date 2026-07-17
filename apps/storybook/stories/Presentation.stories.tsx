import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  BarChart,
  ChartContainer,
  LineChart,
  PieChart,
  Stat,
} from "@axicharts/charts";
import { presentationTheme } from "@axicharts/charts-theme";

const categories = ["Q1", "Q2", "Q3", "Q4"];
const revenue = [820, 932, 901, 1034];

function PresentationDemo(): ReactElement {
  return (
    <div style={{ display: "grid", gap: 20, maxWidth: 960 }}>
      <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 16 }}>
        <Stat value="62.4%" label="Gross margin" tone="success" />
        <ChartContainer
          theme={presentationTheme}
          mode="presentation"
          width="100%"
          height={220}
        >
          <LineChart
            categories={categories}
            series={[{ name: "Revenue", data: revenue }]}
            fill
          />
        </ChartContainer>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <ChartContainer theme={presentationTheme} mode="presentation" width="100%" height={220}>
          <BarChart
            categories={categories}
            series={[{ name: "ARR", data: revenue }]}
            showValues
          />
        </ChartContainer>
        <ChartContainer theme={presentationTheme} mode="presentation" width="100%" height={220}>
          <PieChart
            slices={[
              { name: "Enterprise", value: 58 },
              { name: "Mid-market", value: 27 },
              { name: "SMB", value: 15 },
            ]}
          />
        </ChartContainer>
      </div>
    </div>
  );
}

const meta = {
  title: "Charts/Presentation",
  component: PresentationDemo,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof PresentationDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const HeroAndCharts: Story = {
  render: () => <PresentationDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "Presentation mode — enter fade on ChartContainer, Stat count-up, and ECharts pie sweep.",
      },
    },
  },
};
