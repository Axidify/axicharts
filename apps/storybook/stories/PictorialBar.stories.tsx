import { useEffect, useMemo, useState, type ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  ChartContainer,
  PictorialBarChart,
  type PictorialBarData,
  type PictorialBarItem,
} from "@axicharts/charts/pictorial-bar";
import { compilePanel } from "@axicharts/charts-spec";
import { cleanTheme } from "@axicharts/charts-theme";
import resourcesFixture from "../../../packages/charts-spec/examples/pictorial-bar-resources.panel.json";

const STATIC_ITEMS: PictorialBarItem[] = [
  { category: "CPU", value: 72, symbol: "roundRect", tone: "info" },
  { category: "Memory", value: 58, symbol: "rect" },
  { category: "Storage", value: 41, symbol: "triangle" },
  { category: "Network", value: 29, symbol: "diamond" },
];

function PictorialBarStaticDemo(): ReactElement {
  return (
    <div style={{ maxWidth: 720 }}>
      <ChartContainer theme={cleanTheme} height={260} width="100%">
        <PictorialBarChart items={STATIC_ITEMS} symbol="roundRect" />
      </ChartContainer>
      <p style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
        C125 pictorial bar — resource meters with icon-filled bars
      </p>
    </div>
  );
}

function PictorialBarLiveDemo(): ReactElement {
  const [data, setData] = useState<PictorialBarData>({ items: STATIC_ITEMS });

  useEffect(() => {
    const timer = window.setInterval(() => {
      setData((current) => ({
        ...current,
        items: current.items.map((item) =>
          item.category === "CPU"
            ? { ...item, value: Math.min(100, item.value + 2) }
            : item,
        ),
      }));
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div style={{ maxWidth: 720 }}>
      <ChartContainer theme={cleanTheme} height={260} width="100%" mode="live">
        <PictorialBarChart data={data} />
      </ChartContainer>
      <p style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
        Live mode — CPU usage ticks up via `mergeOption`
      </p>
    </div>
  );
}

function PictorialBarSpecDemo(): ReactElement {
  const rows = useMemo(
    () => [
      { resource: "CPU", used: 72 },
      { resource: "Memory", used: 58 },
      { resource: "Storage", used: 41 },
    ],
    [],
  );
  const panel = useMemo(
    () => compilePanel(resourcesFixture, rows),
    [rows],
  );

  return (
    <div style={{ maxWidth: 720 }}>
      {panel}
      <p style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
        Spec-compiled from `pictorial-bar-resources.panel.json`
      </p>
    </div>
  );
}

const meta = {
  title: "Charts/Pictorial bar",
  component: PictorialBarStaticDemo,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "C125 Pictorial bar — ECharts pictorialBar series with symbolRepeat + symbolClip; resource usage meters; spec `type: pictorial-bar`.",
      },
    },
  },
} satisfies Meta<typeof PictorialBarStaticDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ResourceMeters: Story = {
  render: () => <PictorialBarStaticDemo />,
};

export const LiveCpuTick: Story = {
  render: () => <PictorialBarLiveDemo />,
};

export const SpecFixture: Story = {
  render: () => <PictorialBarSpecDemo />,
};
