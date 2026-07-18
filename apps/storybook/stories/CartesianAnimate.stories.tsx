import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  AreaChart,
  BarChart,
  ChartContainer,
  LineChart,
} from "@axicharts/charts";
import { cleanTheme } from "@axicharts/charts-theme";

const INITIAL = {
  categories: ["Q1", "Q2", "Q3", "Q4"],
  series: [{ name: "Revenue", data: [820, 932, 901, 1034] }],
};

const UPDATED = {
  categories: ["Q1", "Q2", "Q3", "Q4"],
  series: [{ name: "Revenue", data: [880, 960, 940, 1102] }],
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
  title: "Charts/Motion/CartesianAnimate",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const EnterAnimations: Story = {
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: 20,
        padding: 16,
      }}
    >
      <Panel title="Line enter">
        <ChartContainer theme={cleanTheme} height={200} mode="static">
          <LineChart {...INITIAL} animate="enter" />
        </ChartContainer>
      </Panel>
      <Panel title="Bar grow">
        <ChartContainer theme={cleanTheme} height={200} mode="static">
          <BarChart {...INITIAL} animate="enter" />
        </ChartContainer>
      </Panel>
      <Panel title="Area fade + rise">
        <ChartContainer theme={cleanTheme} height={200} mode="static">
          <AreaChart {...INITIAL} animate="enter" />
        </ChartContainer>
      </Panel>
    </div>
  ),
};

function UpdateDemo(): ReactElement {
  const [data, setData] = useState(INITIAL);
  return (
    <div style={{ width: 420 }}>
      <button
        type="button"
        onClick={() =>
          setData((current) =>
            current === INITIAL ? UPDATED : INITIAL,
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
        Toggle data (update animation)
      </button>
      <ChartContainer theme={cleanTheme} height={220} mode="interactive">
        <LineChart {...data} animate="update" />
      </ChartContainer>
    </div>
  );
}

export const UpdateOnClick: Story = {
  render: () => <UpdateDemo />,
};

export const LiveIgnoresAnimate: Story = {
  render: () => (
    <Panel title="Live mode — animate ignored (no dev warning in Storybook prod build)">
      <ChartContainer theme={cleanTheme} height={200} mode="live">
        <LineChart {...INITIAL} animate="enter" />
      </ChartContainer>
    </Panel>
  ),
};

const LIVE_TICK = {
  categories: ["t0", "t1", "t2", "t3", "t4"],
  series: [{ name: "Signal", data: [42, 44, 43, 45, 44] }],
};

const LIVE_WHOLESALE = {
  categories: ["A", "B", "C", "D"],
  series: [
    { name: "Alpha", data: [10, 20, 15, 25] },
    { name: "Beta", data: [8, 12, 18, 14] },
  ],
};

function LiveCrossfadeDemo(): ReactElement {
  const [data, setData] = useState(LIVE_TICK);

  useEffect(() => {
    let n = 0;
    const id = window.setInterval(() => {
      n += 1;
      setData((current) => ({
        ...current,
        series: [
          {
            name: current.series[0]!.name,
            data: current.series[0]!.data.map((value, index) =>
              value + Math.sin((n + index) * 0.4) * 2,
            ),
          },
        ],
      }));
    }, 200);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div style={{ width: 420 }}>
      <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 12px" }}>
        Value ticks at 5 Hz — no crossfade. Wholesale replace triggers one
        brief opacity crossfade.
      </p>
      <button
        type="button"
        onClick={() => setData(LIVE_WHOLESALE)}
        style={{
          marginBottom: 12,
          marginRight: 8,
          padding: "6px 12px",
          borderRadius: 6,
          border: "1px solid #cbd5e1",
          background: "#fff",
          cursor: "pointer",
        }}
      >
        Wholesale replace (structure change)
      </button>
      <button
        type="button"
        onClick={() => setData(LIVE_TICK)}
        style={{
          marginBottom: 12,
          padding: "6px 12px",
          borderRadius: 6,
          border: "1px solid #cbd5e1",
          background: "#fff",
          cursor: "pointer",
        }}
      >
        Reset tick stream
      </button>
      <ChartContainer theme={cleanTheme} height={220} mode="live" liveAnimate="crossfade">
        <LineChart {...data} refreshHz={5} />
      </ChartContainer>
    </div>
  );
}

export const LiveCrossfade: Story = {
  render: () => <LiveCrossfadeDemo />,
};
