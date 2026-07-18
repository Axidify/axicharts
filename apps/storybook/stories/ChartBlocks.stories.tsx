import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Chart } from "@axicharts/charts-spec";
import blocksSpec from "../../../packages/charts-spec/examples/blocks-revenue-target.panel.json";
import { StudioLiveDashboard } from "../demo/StudioLiveDashboard";

const BLOCK_ROWS = [
  { week: "W1", revenue: 42, target: 40 },
  { week: "W2", revenue: 48, target: 44 },
  { week: "W3", revenue: 51, target: 48 },
  { week: "W4", revenue: 47, target: 50 },
  { week: "W5", revenue: 55, target: 52 },
  { week: "W6", revenue: 58, target: 54 },
];

function BlocksSpecPanel(): ReactElement {
  return (
    <div style={{ maxWidth: 720 }}>
      <Chart panel={blocksSpec} data={BLOCK_ROWS} />
      <p style={{ marginTop: 10, fontSize: 12, color: "#64748b" }}>
        C137 — <code>type: "cartesian"</code> with <code>marks[]</code> (bar + line +
        rule + band) compiles to <code>CartesianChart</code> for AI and runtime agents.
      </p>
    </div>
  );
}

function BlocksCatalog(): ReactElement {
  return (
    <div style={{ display: "grid", gap: 28, maxWidth: 1080 }}>
      <section>
        <h2 style={{ margin: "0 0 8px", fontSize: 16 }}>Block spec panel</h2>
        <p style={{ margin: "0 0 12px", fontSize: 13, color: "#64748b" }}>
          JSON-first building blocks — mix series marks and reference overlays in one
          cartesian panel.
        </p>
        <BlocksSpecPanel />
      </section>
      <section>
        <h2 style={{ margin: "0 0 8px", fontSize: 16 }}>
          Live + studio dashboard
        </h2>
        <p style={{ margin: "0 0 12px", fontSize: 13, color: "#64748b" }}>
          Hand-built dashboard combining realtime canvas charts and static studio SVG
          custom marks.
        </p>
        <StudioLiveDashboard />
      </section>
    </div>
  );
}

const meta = {
  title: "Charts/Blocks",
  component: BlocksCatalog,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "C137 chart building blocks — `marks[]` on `type: cartesian` panels compile to `CartesianChart`. Eject emits composable block JSX.",
      },
    },
  },
} satisfies Meta<typeof BlocksCatalog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Catalog: Story = {
  render: () => <BlocksCatalog />,
};

export const SpecOnly: Story = {
  render: () => <BlocksSpecPanel />,
};

export const StudioLiveWall: Story = {
  render: () => <StudioLiveDashboard />,
};
