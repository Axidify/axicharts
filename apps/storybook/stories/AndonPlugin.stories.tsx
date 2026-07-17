import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ChartContainer } from "@axicharts/charts";
import { AndonBoard, SAMPLE_ANDON_STATIONS } from "@axicharts/charts-andon";
import "@axicharts/charts-andon/register";
import { industrialTheme } from "@axicharts/charts-theme";

const meta = {
  title: "Plugins/Andon",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "C5 community plugin `@axicharts/charts-andon` — production line andon board registered via `registerChartType`.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const PackagingLine: Story = {
  render: (): ReactElement => (
    <ChartContainer theme={industrialTheme} width={420} height={220}>
      <AndonBoard stations={SAMPLE_ANDON_STATIONS} columns={4} />
    </ChartContainer>
  ),
};
