import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ChartContainer } from "@axicharts/charts";
import { GanttChart, SAMPLE_GANTT_PROGRAM } from "@axicharts/charts-gantt";
import "@axicharts/charts-gantt/register";
import { cleanTheme, industrialTheme } from "@axicharts/charts-theme";

const meta = {
  title: "Plugins/Gantt",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "C5+ community plugin `@axicharts/charts-gantt` — program timeline with milestones, today marker, hover emphasis, and theme-aware surfaces.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const ProgramTimeline: Story = {
  render: (): ReactElement => (
    <ChartContainer theme={cleanTheme} width={520} height={240}>
      <GanttChart {...SAMPLE_GANTT_PROGRAM} today={11} />
    </ChartContainer>
  ),
};

export const IndustrialSurface: Story = {
  render: (): ReactElement => (
    <ChartContainer theme={industrialTheme} width={520} height={240}>
      <GanttChart {...SAMPLE_GANTT_PROGRAM} today={11} />
    </ChartContainer>
  ),
};
