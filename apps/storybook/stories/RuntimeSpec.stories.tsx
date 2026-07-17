import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import example from "../../../packages/charts-runtime/examples/ops-mosaic.runtime.json";
import { MosaicWall, parseRuntimeSpec, serializeRuntimeSpec } from "@axicharts/charts-runtime";

const meta = {
  title: "Runtime/Spec",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "C4 runtime spec export/import — portable JSON for multi-source mosaic walls and alarm chrome.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const MultiSourceMosaic: Story = {
  render: (): ReactElement => {
    const spec = parseRuntimeSpec(JSON.stringify(example));
    if (spec.layout !== "mosaic") {
      throw new Error("Expected mosaic runtime spec");
    }
    return <MosaicWall wall={spec.wall} />;
  },
};

export const PortableJson: Story = {
  render: (): ReactElement => (
    <pre
      style={{
        margin: 0,
        padding: 16,
        borderRadius: 8,
        background: "#0f172a",
        color: "#e2e8f0",
        fontSize: 12,
        overflow: "auto",
      }}
    >
      {serializeRuntimeSpec(parseRuntimeSpec(JSON.stringify(example)))}
    </pre>
  ),
};
