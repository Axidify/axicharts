import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { compileTemplate } from "@axicharts/charts-spec";
import "@axicharts/charts-gantt/register";

function ProgramDashboardDemo(): ReactElement {
  return compileTemplate("program-dashboard", {}, { theme: "clean" });
}

const meta = {
  title: "Mockups/Q · Program Dashboard",
  component: ProgramDashboardDemo,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Project / program management — burndown, velocity, status donut, delivery funnel, Gantt timeline (gantt plugin).",
      },
    },
  },
} satisfies Meta<typeof ProgramDashboardDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SprintWall: Story = {
  render: () => <ProgramDashboardDemo />,
};
