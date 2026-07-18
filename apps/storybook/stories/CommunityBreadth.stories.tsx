import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Chart } from "@axicharts/charts-spec";
import { DEFAULT_PLUGINS_WALL_PANELS } from "@axicharts/charts-spec";

const geoPanel = DEFAULT_PLUGINS_WALL_PANELS.find((panel) => panel.type === "geo")!;
const sankeyPanel = DEFAULT_PLUGINS_WALL_PANELS.find((panel) => panel.type === "sankey")!;

function CommunityBreadthGrid(): ReactElement {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: 16,
        maxWidth: 960,
      }}
    >
      <Chart panel={geoPanel} data={{}} />
      <Chart panel={sankeyPanel} data={{}} />
      <Chart
        panel={{
          type: "gantt",
          title: "Sprint timeline",
          height: 220,
          props: {
            tasks: [
              { name: "Discovery", start: 0, end: 4, progress: 1, tone: "success" },
              { name: "Build", start: 7, end: 16, progress: 0.55, tone: "info" },
            ],
            milestones: [{ label: "Beta", at: 12, tone: "warning" }],
            today: 11,
          },
        }}
        data={{}}
      />
    </div>
  );
}

const meta = {
  title: "Spec/Community breadth",
  component: CommunityBreadthGrid,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "C88 — sankey, geo, and gantt compile from panel spec without manual `@axicharts/charts-*/register` imports in the story file.",
      },
    },
  },
} satisfies Meta<typeof CommunityBreadthGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SpecFirstPlugins: Story = {
  render: () => <CommunityBreadthGrid />,
};
