import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ChartContainer } from "@axicharts/charts";
import { SankeyChart, SAMPLE_SANKEY_FLOW } from "@axicharts/charts-sankey";
import "@axicharts/charts-sankey/register";
import { cleanTheme, industrialTheme } from "@axicharts/charts-theme";

const meta = {
  title: "Plugins/Sankey",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "C5 community plugin `@axicharts/charts-sankey` — ECharts Sankey flow with theme-aware palette and ChartContainer sizing.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const EnergyAllocation: Story = {
  render: (): ReactElement => (
    <ChartContainer theme={cleanTheme} width={480} height={260}>
      <SankeyChart {...SAMPLE_SANKEY_FLOW} />
    </ChartContainer>
  ),
};

export const IndustrialFlow: Story = {
  render: (): ReactElement => (
    <ChartContainer theme={industrialTheme} width={480} height={260}>
      <SankeyChart {...SAMPLE_SANKEY_FLOW} />
    </ChartContainer>
  ),
};
