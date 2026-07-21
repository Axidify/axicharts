import type { Meta, StoryObj } from "@storybook/react";
import { DashboardAdjacentCompare } from "../demo/DashboardAdjacentCompare";

const meta = {
  title: "Audit/Dashboard adjacent",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Lane B dashboard-adjacent charts @ 360×280 (funnel, waterfall, heatmap, calendar, KPI, table). See docs/chart-design-audit.md Phase 2.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Lane B wall — visual CI baseline for D-220–D-223 + D-106/D-107. */
export const LaneBTile360: Story = {
  render: () => <DashboardAdjacentCompare />,
};
