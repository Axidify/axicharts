import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ChartContainer } from "@axicharts/charts";
import { GeoMapChart, SAMPLE_GEO_REGIONS } from "@axicharts/charts-geo";
import "@axicharts/charts-geo/register";
import { cleanTheme } from "@axicharts/charts-theme";

const meta = {
  title: "Plugins/Geo",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "C5 community plugin `@axicharts/charts-geo` — regional cartogram map registered via `registerChartType`.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const RegionalUtilization: Story = {
  render: (): ReactElement => (
    <ChartContainer theme={cleanTheme} width={320} height={200}>
      <GeoMapChart regions={SAMPLE_GEO_REGIONS} />
    </ChartContainer>
  ),
};
