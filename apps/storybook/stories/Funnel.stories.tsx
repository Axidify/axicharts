import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ChartContainer, FunnelChart } from "@axicharts/charts";
import { cleanTheme } from "@axicharts/charts-theme";

const STAGES = [
  { name: "Leads", value: 240, tone: "info" as const },
  { name: "Qualified", value: 160 },
  { name: "Proposal", value: 92, tone: "warning" as const },
  { name: "Won", value: 48, tone: "success" as const },
];

function PipelineFunnel(): ReactElement {
  return (
    <div style={{ maxWidth: 420 }}>
      <ChartContainer theme={cleanTheme} height={320} width="100%">
        <FunnelChart stages={STAGES} />
      </ChartContainer>
    </div>
  );
}

const meta = {
  title: "Charts/Funnel",
  component: PipelineFunnel,
  parameters: { layout: "padded" },
} satisfies Meta<typeof PipelineFunnel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DeliveryPipeline: Story = {
  render: () => <PipelineFunnel />,
};
