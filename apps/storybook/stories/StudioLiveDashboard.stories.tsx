import type { Meta, StoryObj } from "@storybook/react";
import { StudioLiveDashboard } from "../demo/StudioLiveDashboard";

const meta = {
  title: "Charts/Studio Live Dashboard",
  component: StudioLiveDashboard,
  parameters: {
    layout: "padded",
    backgrounds: { default: "light" },
    docs: {
      description: {
        component:
          "Mixed demo dashboard — live canvas KPIs and main latency chart (`mode: live`, 5 Hz) alongside studio-themed static SVG panels (`StudioLineChart`, `StudioBarChart`) and C133 custom `renderPath` / `renderBar` marks.",
      },
    },
  },
} satisfies Meta<typeof StudioLiveDashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ProductOps: Story = {
  render: () => <StudioLiveDashboard />,
};
