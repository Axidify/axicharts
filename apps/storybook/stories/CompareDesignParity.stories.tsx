import type { Meta, StoryObj } from "@storybook/react";
import { RechartsParityCompare } from "../demo/RechartsParityCompare";

const meta = {
  title: "Compare/Design parity",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: "Recharts vs AxiCharts at 360×280. Docs: /compare/design",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Gallery: Story = {
  render: () => <RechartsParityCompare />,
};
