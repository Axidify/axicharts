import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ChartContainer, SunburstChart } from "@axicharts/charts";
import { cleanTheme } from "@axicharts/charts-theme";

const PORTFOLIO = [
  {
    name: "Equities",
    children: [
      { name: "US Large Cap", value: 38, tone: "info" as const },
      { name: "US Small Cap", value: 12, tone: "default" as const },
      { name: "International", value: 18, tone: "success" as const },
    ],
  },
  {
    name: "Fixed Income",
    children: [
      { name: "Treasuries", value: 16 },
      { name: "Corporate", value: 9, tone: "warning" as const },
    ],
  },
  {
    name: "Alternatives",
    children: [
      { name: "Real Estate", value: 4 },
      { name: "Commodities", value: 3, tone: "critical" as const },
    ],
  },
];

function PortfolioSunburst(): ReactElement {
  return (
    <div style={{ maxWidth: 560 }}>
      <ChartContainer theme={cleanTheme} height={360} width="100%">
        <SunburstChart nodes={PORTFOLIO} />
      </ChartContainer>
      <p style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
        Radial hierarchy — hover segments for value and share
      </p>
    </div>
  );
}

const meta = {
  title: "Charts/Sunburst",
  component: PortfolioSunburst,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "C99 SunburstChart — nested hierarchy via ECharts with React tooltip overlay.",
      },
    },
  },
} satisfies Meta<typeof PortfolioSunburst>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PortfolioAllocation: Story = {
  render: () => <PortfolioSunburst />,
};
