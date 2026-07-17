import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ChartContainer, PieChart } from "@axicharts/charts";
import { cleanTheme } from "@axicharts/charts-theme";

const SLICES = [
  { name: "Product", value: 48 },
  { name: "Services", value: 28 },
  { name: "Support", value: 14 },
  { name: "Other", value: 10 },
];

function DonutDemo(): ReactElement {
  return (
    <div style={{ maxWidth: 360 }}>
      <ChartContainer theme={cleanTheme} mode="interactive" height={260} width="100%">
        <PieChart slices={SLICES} innerRadius={42} showLabels />
      </ChartContainer>
      <p style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
        Revenue mix — use <code>type: &quot;donut&quot;</code> in charts-spec or{" "}
        <code>innerRadius</code> on <code>PieChart</code>
      </p>
    </div>
  );
}

const meta = {
  title: "Charts/Donut",
  component: DonutDemo,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "C2 donut variant — PieChart with innerRadius, or charts-spec panel type donut (default innerRadius 42).",
      },
    },
  },
} satisfies Meta<typeof DonutDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RevenueMix: Story = {
  render: () => <DonutDemo />,
};
