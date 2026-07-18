import type { Meta, StoryObj } from "@storybook/react";
import { ChartContainer, WaterfallChart } from "@axicharts/charts";
import { cleanTheme } from "@axicharts/charts-theme";

const BRIDGE_ITEMS = [
  { name: "Q1", value: 1100000, isTotal: true },
  { name: "New ARR", value: 240000 },
  { name: "Expansion", value: 120000 },
  { name: "Churn", value: -80000, tone: "critical" as const },
  { name: "Services", value: 50000 },
  { name: "Q2", value: 1330000, isTotal: true },
];

function IbcsWaterfallDemo() {
  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
        IBCS variance bridge
      </div>
      <ChartContainer theme={cleanTheme} height={260} width="100%">
        <WaterfallChart
          items={BRIDGE_ITEMS}
          valueFormat="currency"
          showLabels
          showSigns
          connectorStyle="dashed"
        />
      </ChartContainer>
      <p style={{ marginTop: 8, fontSize: 11, color: "#64748b" }}>
        Dashed connector lines · signed delta labels · total bars with inset labels
      </p>
    </div>
  );
}

const meta = {
  title: "Charts/Finance",
  component: IbcsWaterfallDemo,
  parameters: {
    docs: {
      description: {
        component:
          "C111 financial polish — IBCS waterfall connectors, signed delta labels, total bar styling.",
      },
    },
  },
} satisfies Meta<typeof IbcsWaterfallDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const IbcsWaterfall: Story = {
  render: () => <IbcsWaterfallDemo />,
};
