import { useEffect, useMemo, useState, type ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  SwarmChart,
  ChartContainer,
  type SwarmItem,
} from "@axicharts/charts/swarm";
import { compilePanel } from "@axicharts/charts-spec";
import { cleanTheme } from "@axicharts/charts-theme";
import swarmFixture from "../../../packages/charts-spec/examples/swarm-latency.panel.json";

function sampleFrom(mean: number, spread: number, count: number): number[] {
  return Array.from({ length: count }, () => {
    const noise = (Math.random() - 0.5) * spread;
    return Math.max(1, Math.round(mean + noise));
  });
}

const LATENCY_SWARMS: SwarmItem[] = [
  { category: "API", values: sampleFrom(45, 40, 48) },
  { category: "DB", values: sampleFrom(32, 28, 48) },
  { category: "Cache", values: sampleFrom(8, 6, 48) },
  { category: "Queue", values: sampleFrom(58, 50, 48) },
];

const LATENCY_ROWS = LATENCY_SWARMS.flatMap((item) =>
  item.values!.map((latency_ms) => ({
    service: item.category,
    latency_ms,
  })),
);

function SwarmStaticDemo(): ReactElement {
  return (
    <div style={{ maxWidth: 720 }}>
      <ChartContainer theme={cleanTheme} height={360} width={640}>
        <SwarmChart items={LATENCY_SWARMS} valueSuffix=" ms" showMedianLine />
      </ChartContainer>
      <p style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
        C130 swarm chart — jittered points per service showing distribution density
      </p>
    </div>
  );
}

function SwarmLiveDemo(): ReactElement {
  const [items, setItems] = useState(LATENCY_SWARMS);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setItems((current) =>
        current.map((item) => ({
          ...item,
          values: item.values!.map((value) =>
            Math.max(1, Math.round(value + (Math.random() - 0.5) * 8)),
          ),
        })),
      );
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div style={{ maxWidth: 720 }}>
      <ChartContainer theme={cleanTheme} height={360} width={640} mode="live">
        <SwarmChart items={items} valueSuffix=" ms" />
      </ChartContainer>
      <p style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
        Live mode — nudges sample values @ 1 Hz
      </p>
    </div>
  );
}

function SwarmSpecDemo(): ReactElement {
  const rows = useMemo(() => LATENCY_ROWS, []);
  const panel = useMemo(() => compilePanel(swarmFixture, rows), [rows]);

  return (
    <div style={{ maxWidth: 720 }}>
      {panel}
      <p style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
        Spec-compiled from `swarm-latency.panel.json`
      </p>
    </div>
  );
}

const meta = {
  title: "Charts/Swarm chart",
  component: SwarmStaticDemo,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "C130 Swarm chart — beeswarm / jittered strip plot per category; spec `type: swarm` (alias `beeswarm`).",
      },
    },
  },
} satisfies Meta<typeof SwarmStaticDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ServiceLatency: Story = {
  render: () => <SwarmStaticDemo />,
};

export const LiveValuePulse: Story = {
  render: () => <SwarmLiveDemo />,
};

export const SpecFixture: Story = {
  render: () => <SwarmSpecDemo />,
};
