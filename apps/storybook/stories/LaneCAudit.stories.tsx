import type { Meta, StoryObj } from "@storybook/react";
import { LaneCAdjacentCompare } from "../demo/LaneCAdjacentCompare";

const meta = {
  title: "Audit/Niche industrial",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Lane C niche / industrial charts @ catalog card sizes. See docs/chart-design-audit.md Phase 3.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Lane C wall — visual CI baseline for D-401–D-408. */
export const LaneCTileWall: Story = {
  render: () => <LaneCAdjacentCompare />,
};
