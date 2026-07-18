import type { ReactElement } from "react";
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  AreaChart,
  BarChart,
  ChartContainer,
  LineChart,
  Stat,
} from "@axicharts/charts";
import { cleanTheme } from "@axicharts/charts-theme";
import { applyCountUpPreset } from "@axicharts/charts/motion";

const MULTI_SERIES = {
  categories: ["Q1", "Q2", "Q3", "Q4"],
  series: [
    { name: "Revenue", data: [820, 932, 901, 1034] },
    { name: "Costs", data: [620, 712, 680, 734] },
    { name: "Margin", data: [200, 220, 221, 300] },
  ],
};

const BAR_DATA = {
  categories: ["Jan", "Feb", "Mar", "Apr"],
  series: [{ name: "Signups", data: [120, 180, 150, 220] }],
};

const AREA_DATA = {
  categories: ["W1", "W2", "W3", "W4", "W5"],
  series: [{ name: "Sessions", data: [420, 510, 480, 620, 700] }],
};

const MORPH_INITIAL = {
  categories: ["A", "B", "C", "D"],
  series: [{ name: "Value", data: [40, 65, 55, 80] }],
};

const MORPH_UPDATED = {
  categories: ["A", "B", "C", "D"],
  series: [{ name: "Value", data: [55, 48, 72, 60] }],
};

function Panel({
  title,
  children,
}: {
  title: string;
  children: ReactElement;
}): ReactElement {
  return (
    <div style={{ width: 360 }}>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  );
}

const meta = {
  title: "Charts/Motion/MotionPresets",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const PresetWall: Story = {
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: 20,
        padding: 16,
      }}
    >
      <Panel title="stagger — multi-series line">
        <ChartContainer theme={cleanTheme} height={220} mode="static">
          <LineChart {...MULTI_SERIES} animate="stagger" renderer="svg" />
        </ChartContainer>
      </Panel>
      <Panel title="spring — bar enter">
        <ChartContainer theme={cleanTheme} height={220} mode="static">
          <BarChart {...BAR_DATA} animate="spring" />
        </ChartContainer>
      </Panel>
      <Panel title="gentle — area enter">
        <ChartContainer theme={cleanTheme} height={220} mode="static">
          <AreaChart {...AREA_DATA} animate="gentle" />
        </ChartContainer>
      </Panel>
      <Panel title="countUp — Stat (presentation)">
        <ChartContainer theme={cleanTheme} height={120} mode="presentation">
          <Stat
            value="$1,284,000"
            label={`ARR (${applyCountUpPreset().duration}ms preset)`}
          />
        </ChartContainer>
      </Panel>
    </div>
  ),
};

function MorphDemo(): ReactElement {
  const [data, setData] = useState(MORPH_INITIAL);
  return (
    <div style={{ width: 420 }}>
      <button
        type="button"
        onClick={() =>
          setData((current) =>
            current === MORPH_INITIAL ? MORPH_UPDATED : MORPH_INITIAL,
          )
        }
        style={{
          marginBottom: 12,
          padding: "6px 12px",
          borderRadius: 6,
          border: "1px solid #cbd5e1",
          background: "#fff",
          cursor: "pointer",
        }}
      >
        Toggle data (morph preset)
      </button>
      <ChartContainer theme={cleanTheme} height={220} mode="interactive">
        <LineChart {...data} animate="morph" />
      </ChartContainer>
    </div>
  );
}

export const MorphUpdate: Story = {
  render: () => <MorphDemo />,
};
