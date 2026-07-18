import type { Meta, StoryObj } from "@storybook/react";
import { LiveOpsCompareDemo } from "../demo/LiveOpsCompareDemo";

const meta = {
  title: "Compare/Live ops wall",
  component: LiveOpsCompareDemo,
  parameters: {
    layout: "padded",
    backgrounds: { default: "dark" },
    docs: {
      description: {
        component:
          "Killer demo — 6-panel live ops wall @ 5 Hz. AxiCharts (uPlot canvas) vs Recharts (SVG) on the same data stream. Matches published `dashboard-6up` benchmark (6 × 2000 pts).",
      },
    },
  },
  argTypes: {
    pointCount: { control: { type: "number", min: 120, max: 10000, step: 100 } },
    hz: { control: { type: "number", min: 1, max: 10, step: 1 } },
    panelHeight: { control: { type: "number", min: 64, max: 160, step: 4 } },
  },
} satisfies Meta<typeof LiveOpsCompareDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Published benchmark fixture: 6 panels × 2000 pts @ 5 Hz */
export const BenchmarkFixture: Story = {
  args: {
    pointCount: 2000,
    hz: 5,
    panelHeight: 88,
  },
};

/** Lighter fixture for slower machines / docs embed */
export const LightFixture: Story = {
  args: {
    pointCount: 500,
    hz: 5,
    panelHeight: 96,
  },
};
