import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ChartContainer } from "@axicharts/charts";
import {
  MapChart,
  SAMPLE_DRILL_VALUES,
  SAMPLE_US_HIERARCHY,
  SAMPLE_US_TOPOLOGY,
  SAMPLE_US_VALUES,
} from "@axicharts/charts-map";
import "@axicharts/charts-map/register";
import { cleanTheme, industrialTheme } from "@axicharts/charts-theme";

const meta = {
  title: "Plugins/Map",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "C98 community plugin `@axicharts/charts-map` — TopoJSON choropleth with SVG paths, hover tooltip, value scale, drill-down hierarchy, and theme-aware surfaces. Distinct from `charts-geo` cartogram (`type: geo`).",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const UsStatesChoropleth: Story = {
  render: (): ReactElement => (
    <ChartContainer theme={cleanTheme} width={360} height={220}>
      <MapChart topology={SAMPLE_US_TOPOLOGY} values={SAMPLE_US_VALUES} />
    </ChartContainer>
  ),
};

export const IndustrialSurface: Story = {
  render: (): ReactElement => (
    <ChartContainer theme={industrialTheme} width={360} height={220}>
      <MapChart topology={SAMPLE_US_TOPOLOGY} values={SAMPLE_US_VALUES} />
    </ChartContainer>
  ),
};

function LiveValuesDemo(): ReactElement {
  const [values, setValues] = useState(SAMPLE_US_VALUES);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setValues((current) =>
        Object.fromEntries(
          Object.entries(current).map(([key, value]) => [
            key,
            Math.max(10, Math.min(100, value + (Math.random() > 0.5 ? 3 : -3))),
          ]),
        ),
      );
    }, 900);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <ChartContainer theme={cleanTheme} width={360} height={220} mode="live">
      <MapChart topology={SAMPLE_US_TOPOLOGY} values={values} />
    </ChartContainer>
  );
}

export const LiveValueUpdates: Story = {
  render: (): ReactElement => <LiveValuesDemo />,
};

function DrilldownMapDemo(): ReactElement {
  const [path, setPath] = useState<string[]>([]);
  const [labels, setLabels] = useState<string[]>([]);

  return (
    <div style={{ maxWidth: 420 }}>
      <ChartContainer theme={cleanTheme} width={400} height={260}>
        <MapChart
          topology={SAMPLE_US_TOPOLOGY}
          values={SAMPLE_DRILL_VALUES}
          hierarchy={SAMPLE_US_HIERARCHY}
          drilldown
          drillPath={path}
          drillLabels={labels}
          onDrillChange={({ path: nextPath, labels: nextLabels }) => {
            setPath(nextPath);
            setLabels(nextLabels);
          }}
        />
      </ChartContainer>
      <p style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
        Click regions to drill from macro regions → states → counties (CA/TX).
        Use the breadcrumb trail to navigate back.
        {path.length > 0 ? ` Current path: ${labels.join(" / ")}` : ""}
      </p>
    </div>
  );
}

export const Drilldown: Story = {
  render: (): ReactElement => <DrilldownMapDemo />,
};
