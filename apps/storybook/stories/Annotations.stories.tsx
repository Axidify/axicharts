import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  AnnotationBand,
  AnnotationLabel,
  AnnotationLine,
  AnnotationMarker,
  ChartContainer,
  Line,
  LineChart,
  WaterfallChart,
  XAxis,
} from "@axicharts/charts";
import { compilePanel } from "@axicharts/charts-spec";
import { cleanTheme, liveTheme } from "@axicharts/charts-theme";

const HOURS = ["06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00"];
const TEMP_C = [62, 68, 74, 79, 88, 76, 70];
const ROWS = HOURS.map((hour, index) => ({ hour, temp: TEMP_C[index] }));

const PNL_ITEMS = [
  { name: "Revenue", value: 420 },
  { name: "COGS", value: -180 },
  { name: "Opex", value: -95 },
  { name: "Net", value: 145, isTotal: true, tone: "success" as const },
];

function OpsThresholdMarkerDemo(): ReactElement {
  return (
    <div style={{ maxWidth: 560 }}>
      <ChartContainer theme={liveTheme} mode="live" height={260} width="100%">
        <LineChart
          categories={HOURS}
          series={[{ name: "Reactor temp", data: TEMP_C, tone: "info" }]}
          valueSuffix=" °C"
          fill
          annotations={[
            { type: "band", min: 75, max: 85, label: "Warning", tone: "warning" },
            { type: "line", value: 75, label: "High limit", tone: "warning" },
            {
              type: "marker",
              x: "14:00",
              y: 88,
              label: "Peak",
              tone: "critical",
              draggable: true,
            },
          ]}
        />
      </ChartContainer>
      <p style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
        Ops runbook — SLO band, threshold line, draggable incident marker
      </p>
    </div>
  );
}

function FinanceWaterfallAnnotationDemo(): ReactElement {
  return (
    <div style={{ maxWidth: 560 }}>
      <ChartContainer theme={cleanTheme} height={260} width="100%">
        <WaterfallChart items={PNL_ITEMS} valueFormat="currency" />
      </ChartContainer>
      <ChartContainer theme={cleanTheme} height={220} width="100%">
        <LineChart
          categories={PNL_ITEMS.map((item) => item.name)}
          series={[
            {
              name: "Bridge",
              data: PNL_ITEMS.map((item) => Math.abs(item.value)),
              tone: "info",
            },
          ]}
          annotations={[
            {
              type: "label",
              text: "Net margin",
              x: "Net",
              y: 145,
              tone: "success",
              position: "top",
            },
            {
              type: "line",
              orientation: "vertical",
              value: 0,
              x: "COGS",
              label: "Cost review",
              tone: "warning",
            },
          ]}
        />
      </ChartContainer>
      <p style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
        Finance — waterfall plus declarative bridge labels from spec annotations
      </p>
    </div>
  );
}

function ComposableAnnotationsDemo(): ReactElement {
  return (
    <ChartContainer theme={liveTheme} height={240} width="100%">
      <LineChart data={ROWS}>
        <XAxis dataKey="hour" />
        <Line dataKey="temp" name="Reactor temp" />
        <AnnotationBand min={75} max={85} label="Warn band" tone="warning" />
        <AnnotationLine value={75} label="Limit" tone="warning" />
        <AnnotationMarker x="12:00" y={79} draggable tone="info" />
      </LineChart>
    </ChartContainer>
  );
}

function SpecCompileDemo(): ReactElement {
  return compilePanel(
    {
      type: "line",
      theme: "live",
      mode: "live",
      height: 240,
      encoding: {
        x: { field: "hour" },
        y: { field: "temp" },
      },
      annotations: [
        { type: "band", min: 75, max: 85, label: "Warning", tone: "warning" },
        {
          type: "marker",
          x: "14:00",
          y: 88,
          draggable: true,
          tone: "critical",
        },
      ],
    },
    ROWS,
  );
}

const meta = {
  title: "Charts/Annotations",
  component: OpsThresholdMarkerDemo,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "C96 annotation layer — declarative labels, bands, lines, and draggable markers on cartesian panels.",
      },
    },
  },
} satisfies Meta<typeof OpsThresholdMarkerDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OpsThresholdAndMarker: Story = {
  render: () => <OpsThresholdMarkerDemo />,
};

export const FinanceWaterfallLabels: Story = {
  render: () => <FinanceWaterfallAnnotationDemo />,
};

export const ComposableMarks: Story = {
  render: () => <ComposableAnnotationsDemo />,
};

export const SpecCompile: Story = {
  render: () => <SpecCompileDemo />,
};
