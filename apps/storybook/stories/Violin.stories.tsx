import { useEffect, useMemo, useState, type ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  ViolinChart,
  ChartContainer,
  type ViolinItem,
} from "@axicharts/charts/violin";
import { compilePanel } from "@axicharts/charts-spec";
import { cleanTheme } from "@axicharts/charts-theme";
import violinFixture from "../../../packages/charts-spec/examples/violin-latency.panel.json";

function sampleFrom(mean: number, spread: number, count: number): number[] {
  return Array.from({ length: count }, () => {
    const noise = (Math.random() - 0.5) * spread;
    return Math.max(1, Math.round(mean + noise));
  });
}

const LATENCY_VIOLINS: ViolinItem[] = [
  { category: "API", samples: sampleFrom(45, 40, 48) },
  { category: "DB", samples: sampleFrom(32, 28, 48) },
  { category: "Cache", samples: sampleFrom(8, 6, 48) },
  { category: "Queue", samples: sampleFrom(58, 50, 48) },
];

const LATENCY_ROWS = LATENCY_VIOLINS.flatMap((item) =>
  item.samples!.map((latency_ms) => ({
    service: item.category,
    latency_ms,
  })),
);

function ViolinStaticDemo(): ReactElement {
  return (
    <div style={{ maxWidth: 720 }}>
      <ChartContainer theme={cleanTheme} height={360} width={640}>
        <ViolinChart items={LATENCY_VIOLINS} valueSuffix=" ms" />
      </ChartContainer>
      <p style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
        C129 violin chart — mirrored KDE density per service with inner boxplot
      </p>
    </div>
  );
}

function ViolinLiveDemo(): ReactElement {
  const [items, setItems] = useState(LATENCY_VIOLINS);

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
        <ViolinChart items={items} valueSuffix=" ms" />
      </ChartContainer>
      <p style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
        Live mode — nudges sample values @ 1 Hz
      </p>
    </div>
  );
}

function ViolinSpecDemo(): ReactElement {
  const rows = useMemo(() => LATENCY_ROWS, []);
  const panel = useMemo(() => compilePanel(violinFixture, rows), [rows]);

  return (
    <div style={{ maxWidth: 720 }}>
      {panel}
      <p style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
        Spec-compiled from `violin-latency.panel.json`
      </p>
    </div>
  );
}

const meta = {
  title: "Charts/Violin chart",
  component: ViolinStaticDemo,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "C129 Violin chart — KDE/mirrored density per category with optional inner boxplot; spec `type: violin`.",
      },
    },
  },
} satisfies Meta<typeof ViolinStaticDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ServiceLatency: Story = {
  render: () => <ViolinStaticDemo />,
};

export const LiveValuePulse: Story = {
  render: () => <ViolinLiveDemo />,
};

export const SpecFixture: Story = {
  render: () => <ViolinSpecDemo />,
};
