import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  ChartContainer,
  LineChart,
  ScatterChart,
  GraphicRect,
  GraphicText,
} from "@axicharts/charts";
import { compilePanel } from "@axicharts/charts-spec";
import { cleanTheme } from "@axicharts/charts-theme";

const GRAPHICS_FIXTURE = {
  type: "line" as const,
  title: "Ops overlay — graphic highlight",
  height: 280,
  width: 520,
  encoding: {
    x: { field: "hour" },
    y: { field: "temp" },
  },
  valueSuffix: " °C",
  fill: true,
  graphics: [
    {
      type: "rect" as const,
      left: "plot:0.12",
      top: "plot:0.15",
      shape: { width: 140, height: 56, r: 6 },
      style: { fill: "#fef3c7", opacity: 0.6 },
    },
    {
      type: "text" as const,
      left: "category:10:00",
      top: "value:74",
      style: {
        text: "Incident",
        fill: "#dc2626",
        fontSize: 12,
        fontWeight: "600",
      },
    },
  ],
};

const HOURS = ["06:00", "08:00", "10:00", "12:00", "14:00"];
const TEMP = [62, 68, 74, 79, 88];
const ROWS = HOURS.map((hour, index) => ({ hour, temp: TEMP[index] }));

const SCATTER_POINTS = [
  { x: 12, y: 18, label: "A" },
  { x: 28, y: 42, label: "B" },
  { x: 44, y: 36, label: "C" },
];

function CartesianGraphicDemo(): ReactElement {
  return (
    <ChartContainer theme={cleanTheme} height={280} width="100%">
      <LineChart
        categories={HOURS}
        series={[{ name: "Reactor temp", data: TEMP, tone: "info" }]}
        valueSuffix=" °C"
        fill
        graphics={[
          {
            type: "rect",
            left: "plot:0.1",
            top: "plot:0.12",
            shape: { width: 160, height: 64, r: 6 },
            style: { fill: "#fef3c7", opacity: 0.55 },
          },
          {
            type: "text",
            left: "category:14:00",
            top: "value:88",
            style: {
              text: "incident",
              fill: "#dc2626",
              fontSize: 12,
              fontWeight: "600",
            },
          },
        ]}
      />
    </ChartContainer>
  );
}

function ComposableMarksDemo(): ReactElement {
  return (
    <ChartContainer theme={cleanTheme} height={240} width="100%">
      <LineChart categories={HOURS} series={[{ name: "Temp", data: TEMP }]}>
        <GraphicRect
          left="plot:0.55"
          top="plot:0.2"
          width={100}
          height={48}
          style={{ fill: "#dbeafe", opacity: 0.7 }}
        />
        <GraphicText
          left="plot:0.6"
          top="plot:0.35"
          text="Review window"
          style={{ fill: "#1d4ed8", fontSize: 11 }}
        />
      </LineChart>
    </ChartContainer>
  );
}

function ScatterGraphicDemo(): ReactElement {
  return (
    <ChartContainer theme={cleanTheme} height={260} width="100%">
      <ScatterChart
        series={[{ name: "Clusters", points: SCATTER_POINTS }]}
        graphics={[
          {
            type: "circle",
            left: "55%",
            top: "45%",
            shape: { r: 36 },
            style: { fill: "#fbbf24", opacity: 0.25, stroke: "#d97706", lineWidth: 2 },
          },
          {
            type: "text",
            left: "55%",
            top: "38%",
            style: { text: "focus zone", fill: "#92400e", fontSize: 11 },
          },
        ]}
      />
    </ChartContainer>
  );
}

function SpecFixtureDemo(): ReactElement {
  return (
    <ChartContainer theme={cleanTheme} height={280} width="100%">
      {compilePanel(GRAPHICS_FIXTURE, ROWS)}
    </ChartContainer>
  );
}

const meta = {
  title: "Charts/Graphic overlay",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const CartesianHighlight: Story = {
  render: () => <CartesianGraphicDemo />,
};

export const ComposableMarks: Story = {
  render: () => <ComposableMarksDemo />,
};

export const EChartsScatterOverlay: Story = {
  render: () => <ScatterGraphicDemo />,
};

export const SpecCompiledFixture: Story = {
  render: () => <SpecFixtureDemo />,
};
