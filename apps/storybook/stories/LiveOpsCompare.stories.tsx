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
          "Live ops wall stress demo — AxiCharts (uPlot canvas) vs Recharts (SVG) on a synthetic load generator. Isolated flushSync calibration (bench-harness methodology) plus alternating live ticks for fair per-library timing. CI reference numbers shown separately from device-measured p95.",
      },
    },
  },
  argTypes: {
    preset: {
      control: "select",
      options: ["standard", "heavy", "extreme"],
    },
    panelCount: { control: { type: "number", min: 1, max: 12, step: 1 } },
    pointCount: { control: { type: "number", min: 120, max: 10000, step: 100 } },
    hz: { control: { type: "number", min: 1, max: 15, step: 1 } },
    panelHeight: { control: { type: "number", min: 56, max: 160, step: 4 } },
    showControls: { control: "boolean" },
    autoThrottleRecharts: { control: "boolean" },
  },
} satisfies Meta<typeof LiveOpsCompareDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Published benchmark fixture: 6 panels × 2000 pts @ 5 Hz */
export const BenchmarkFixture: Story = {
  args: {
    preset: "standard",
    showControls: true,
  },
};

/** Lighter fixture for slower machines / docs embed */
export const LightFixture: Story = {
  args: {
    preset: "standard",
    pointCount: 500,
    panelHeight: 96,
    showControls: false,
  },
};

/** 8 panels × 3000 pts — Recharts starts to struggle on typical hardware */
export const HeavyFixture: Story = {
  args: {
    preset: "heavy",
    showControls: true,
  },
};

/** 10 panels × 10000 pts @ 10 Hz — pushes Recharts to its limit */
export const ExtremeFixture: Story = {
  args: {
    preset: "extreme",
    showControls: true,
    autoThrottleRecharts: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Maximum stress — expect Recharts frame budget warnings. Toggle auto-throttle in controls to see recovery strategy.",
      },
    },
  },
};

/** Alias for stress-test discovery */
export const StressTest: Story = {
  ...ExtremeFixture,
};
