import { useEffect, useMemo, useState, type ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  RidgelineChart,
  ChartContainer,
  type RidgelineItem,
} from "@axicharts/charts/ridgeline";
import { compilePanel } from "@axicharts/charts-spec";
import { cleanTheme } from "@axicharts/charts-theme";
import ridgelineFixture from "../../../packages/charts-spec/examples/ridgeline-metrics.panel.json";

function sampleFrom(mean: number, spread: number, count: number): number[] {
  return Array.from({ length: count }, () => {
    const noise = (Math.random() - 0.5) * spread;
    return Math.max(1, Math.round(mean + noise));
  });
}

const LATENCY_RIDGES: RidgelineItem[] = [
  { category: "API", samples: sampleFrom(45, 40, 48) },
  { category: "DB", samples: sampleFrom(32, 28, 48) },
  { category: "Cache", samples: sampleFrom(8, 6, 48) },
  { category: "Queue", samples: sampleFrom(58, 50, 48) },
];

const LATENCY_ROWS = LATENCY_RIDGES.flatMap((item) =>
  item.samples!.map((latency_ms) => ({
    service: item.category,
    latency_ms,
  })),
);

function RidgelineStaticDemo(): ReactElement {
  return (
    <div style={{ maxWidth: 720 }}>
      <ChartContainer theme={cleanTheme} height={360} width={640}>
        <RidgelineChart items={LATENCY_RIDGES} valueSuffix=" ms" showMedianLine />
      </ChartContainer>
      <p style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
        C132 ridgeline chart — stacked horizontal KDE density curves per category
      </p>
    </div>
  );
}

function RidgelineLiveDemo(): ReactElement {
  const [items, setItems] = useState(LATENCY_RIDGES);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setItems((current) =>
        current.map((item) => ({
          ...item,
          samples: item.samples!.map((value) =>
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
        <RidgelineChart items={items} valueSuffix=" ms" />
      </ChartContainer>
      <p style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
        Live mode — nudges sample values @ 1 Hz
      </p>
    </div>
  );
}

function RidgelineSpecDemo(): ReactElement {
  const rows = useMemo(() => LATENCY_ROWS, []);
  const panel = useMemo(() => compilePanel(ridgelineFixture, rows), [rows]);

  return (
    <div style={{ maxWidth: 720 }}>
      {panel}
      <p style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
        Spec-compiled from `ridgeline-metrics.panel.json`
      </p>
    </div>
  );
}

const meta = {
  title: "Charts/Ridgeline chart",
  component: RidgelineStaticDemo,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "C132 Ridgeline chart — stacked horizontal KDE density curves per category (joyplot); spec `type: ridgeline` (alias `joyplot`).",
      },
    },
  },
} satisfies Meta<typeof RidgelineStaticDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ServiceLatency: Story = {
  render: () => <RidgelineStaticDemo />,
};

export const LiveValuePulse: Story = {
  render: () => <RidgelineLiveDemo />,
};

export const SpecFixture: Story = {
  render: () => <RidgelineSpecDemo />,
};
