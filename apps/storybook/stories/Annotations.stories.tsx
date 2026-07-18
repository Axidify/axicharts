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

const OPS_ANNOTATIONS = [
  { type: "band" as const, min: 75, max: 85, label: "Warning band", tone: "warning" as const },
  { type: "line" as const, value: 75, label: "High limit", tone: "warning" as const },
  {
    type: "marker" as const,
    x: "14:00",
    y: 88,
    label: "Peak incident",
    tone: "critical" as const,
    draggable: true,
    id: "peak",
  },
];

function OpsFinanceWallDemo(): ReactElement {
  return (
    <div
      style={{
        display: "grid",
        gap: 20,
        maxWidth: 920,
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
      }}
    >
      <section>
        <header style={{ marginBottom: 8 }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Ops — SLO band + incident marker</h3>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b" }}>
            Drag the peak marker vertically; release to snap to the nearest hour.
          </p>
        </header>
        <ChartContainer theme={liveTheme} mode="live" height={260} width="100%">
          <LineChart
            categories={HOURS}
            series={[{ name: "Reactor temp", data: TEMP_C, tone: "info" }]}
            valueSuffix=" °C"
            fill
            annotations={OPS_ANNOTATIONS}
          />
        </ChartContainer>
      </section>

      <section>
        <header style={{ marginBottom: 8 }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Finance — bridge labels</h3>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b" }}>
            Waterfall plus declarative bridge annotations from spec.
          </p>
        </header>
        <ChartContainer theme={cleanTheme} height={220} width="100%">
          <WaterfallChart items={PNL_ITEMS} valueFormat="currency" />
        </ChartContainer>
        <ChartContainer theme={cleanTheme} height={200} width="100%">
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
      </section>
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
        <AnnotationMarker x="12:00" y={79} draggable tone="info" label="Inspect" />
        <AnnotationLabel text="Nominal" x="08:00" y={68} position="top" tone="success" />
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
      annotations: OPS_ANNOTATIONS,
    },
    ROWS,
  );
}

const meta = {
  title: "Charts/Annotations",
  component: OpsFinanceWallDemo,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "C114 annotation polish — contrast band labels, draggable markers with plot-area constraints, and declarative spec round-trip.",
      },
    },
  },
} satisfies Meta<typeof OpsFinanceWallDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Primary visual-regression target — ops SLO band + draggable marker. */
export const OpsFinanceWall: Story = {
  render: () => <OpsFinanceWallDemo />,
};

export const ComposableMarks: Story = {
  render: () => <ComposableAnnotationsDemo />,
};

export const SpecCompile: Story = {
  render: () => <SpecCompileDemo />,
};
