import type { Meta, StoryObj } from "@storybook/react";
import { BlocksPlayground } from "@axicharts/charts-spec";

const meta = {
  title: "Spec/Blocks Playground",
  component: BlocksPlayground,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "C138 — three-pane cartesian blocks playground: editable spec JSON, live validation, chart preview, and composable JSX eject. Presets double as agent few-shot examples.",
      },
    },
  },
} satisfies Meta<typeof BlocksPlayground>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <BlocksPlayground />,
};

export const OpsSlo: Story = {
  render: () => <BlocksPlayground initialPresetId="ops-slo" />,
};

export const Compact: Story = {
  render: () => <BlocksPlayground compact />,
};
