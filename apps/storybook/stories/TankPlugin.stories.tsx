import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ChartContainer } from "@axicharts/charts";
import { TankChart } from "@axicharts/charts-tank";
import "@axicharts/charts-tank/register";
import { industrialTheme } from "@axicharts/charts-theme";

const meta = {
  title: "Plugins/Tank",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "C5 community plugin `@axicharts/charts-tank` — level visualization registered via `registerChartType`.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const StorageFarm: Story = {
  render: (): ReactElement => (
    <div style={{ display: "flex", gap: 16 }}>
      {[
        { level: 42, label: "Tank 1" },
        { level: 68, label: "Tank 2", warningAt: 75 },
        { level: 91, label: "Tank 3", warningAt: 75, criticalAt: 90 },
      ].map((tank) => (
        <ChartContainer key={tank.label} theme={industrialTheme} width={140} height={200}>
          <TankChart {...tank} />
        </ChartContainer>
      ))}
    </div>
  ),
};
