import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Bar,
  BarChart,
  ChartContainer,
  Line,
  LineChart,
  useChartScales,
  XAxis,
  YAxis,
} from "@axicharts/charts";
import { cleanTheme } from "@axicharts/charts-theme";

const DATA = [
  { day: "Mon", units: 42, target: 38 },
  { day: "Tue", units: 58, target: 45 },
  { day: "Wed", units: 51, target: 48 },
  { day: "Thu", units: 63, target: 52 },
  { day: "Fri", units: 71, target: 55 },
];

function GradientStrokeLine(): ReactElement {
  return (
    <LineChart data={DATA}>
      <XAxis dataKey="day" />
      <YAxis />
      <Line
        dataKey="units"
        name="Units"
        renderPath={({ defaultPath, color }) => (
          <>
            <defs>
              <linearGradient id="static-line-gradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                <stop offset="100%" stopColor={color} />
              </linearGradient>
            </defs>
            <path
              d={defaultPath}
              fill="none"
              stroke="url(#static-line-gradient)"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        )}
      />
    </LineChart>
  );
}

function PatternBars(): ReactElement {
  return (
    <BarChart data={DATA}>
      <XAxis dataKey="day" />
      <YAxis />
      <Bar
        dataKey="units"
        name="Units"
        renderBar={({ bar, color }) => (
          <>
            <defs>
              <pattern
                id="static-bar-pattern"
                width={6}
                height={6}
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(45)"
              >
                <rect width={3} height={6} fill={color} opacity={0.35} />
              </pattern>
            </defs>
            <rect
              x={bar.x}
              y={bar.y}
              width={bar.width}
              height={bar.height}
              fill="url(#static-bar-pattern)"
              stroke={color}
              strokeWidth={1}
              rx={6}
            />
          </>
        )}
      />
    </BarChart>
  );
}

function ScalesHookDemo(): ReactElement {
  function MarkerDot({
    index,
    value,
  }: {
    index: number;
    value: number;
  }): ReactElement {
    const { xAt, yAt } = useChartScales();
    return (
      <circle
        cx={xAt(index)}
        cy={yAt(value)}
        r={5}
        fill="#0f172a"
        stroke="#fff"
        strokeWidth={1.5}
      />
    );
  }

  return (
    <LineChart data={DATA}>
      <XAxis dataKey="day" />
      <YAxis />
      <Line
        dataKey="target"
        name="Target"
        tone="warning"
        renderPath={({ defaultPath, color, series }) => (
          <>
            <path
              d={defaultPath}
              fill="none"
              stroke={color}
              strokeWidth={2}
              strokeDasharray="6 4"
            />
            {series.data.map((value, index) => (
              <MarkerDot key={index} index={index} value={value} />
            ))}
          </>
        )}
      />
    </LineChart>
  );
}

function StaticSvgCustomGallery(): ReactElement {
  return (
    <div style={{ display: "grid", gap: 24, maxWidth: 640 }}>
      <section>
        <h3 style={{ margin: "0 0 8px", fontSize: 14 }}>Gradient stroke line</h3>
        <ChartContainer theme={cleanTheme} mode="static" height={220} width="100%">
          <GradientStrokeLine />
        </ChartContainer>
      </section>
      <section>
        <h3 style={{ margin: "0 0 8px", fontSize: 14 }}>Pattern-filled rounded bars</h3>
        <ChartContainer theme={cleanTheme} mode="static" height={220} width="100%">
          <PatternBars />
        </ChartContainer>
      </section>
      <section>
        <h3 style={{ margin: "0 0 8px", fontSize: 14 }}>useChartScales inside renderPath</h3>
        <ChartContainer theme={cleanTheme} mode="static" height={220} width="100%">
          <ScalesHookDemo />
        </ChartContainer>
      </section>
      <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>
        C133 — `renderPath` / `renderBar` on composable marks apply in static SVG mode only
        (&lt; 2k points). Canvas/uPlot ignores these props.
      </p>
    </div>
  );
}

const meta = {
  title: "Charts/StaticSvgCustom",
  component: StaticSvgCustomGallery,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Visx-like custom SVG marks via render props on Line/Area/Bar composable marks in static mode.",
      },
    },
  },
} satisfies Meta<typeof StaticSvgCustomGallery>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CustomMarks: Story = {
  render: () => <StaticSvgCustomGallery />,
};
