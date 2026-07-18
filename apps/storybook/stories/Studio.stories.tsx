import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Line,
  LineChart as RechartsLineChart,
  Bar,
  BarChart as RechartsBarChart,
  Area,
  AreaChart as RechartsAreaChart,
  XAxis as RechartsXAxis,
  YAxis as RechartsYAxis,
} from "recharts";
import { ChartContainer, BarChart, LineChart } from "@axicharts/charts";
import { QuickLineChart } from "@axicharts/charts/quick";
import {
  StudioBarChart,
  StudioLineChart,
} from "@axicharts/charts/studio";
import { cleanTheme } from "@axicharts/charts-theme";
import "@axicharts/charts-theme/studio-tokens.css";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const LATENCY = [42, 38, 55, 49, 62, 58, 71];
const THROUGHPUT = [120, 90, 150, 110, 180, 95, 165];

const ROWS = DAYS.map((day, index) => ({
  day,
  p95: LATENCY[index]!,
  throughput: THROUGHPUT[index]!,
}));

const PANEL: React.CSSProperties = {
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  background: "#ffffff",
  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
  overflow: "hidden",
};

const LABEL: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  marginBottom: 8,
};

function CompareRow({
  leftLabel,
  centerLabel,
  rightLabel,
  left,
  center,
  right,
}: {
  leftLabel: string;
  centerLabel: string;
  rightLabel: string;
  left: ReactElement;
  center: ReactElement;
  right: ReactElement;
}): ReactElement {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: 16,
        alignItems: "start",
      }}
    >
      <div>
        <div style={{ ...LABEL, color: "#94a3b8" }}>{leftLabel}</div>
        <div style={PANEL}>{left}</div>
      </div>
      <div>
        <div style={{ ...LABEL, color: "#64748b" }}>{centerLabel}</div>
        <div style={PANEL}>{center}</div>
      </div>
      <div data-theme="studio">
        <div style={{ ...LABEL, color: "#2563eb" }}>{rightLabel}</div>
        <div style={PANEL}>{right}</div>
      </div>
    </div>
  );
}

function RechartsBareLine(): ReactElement {
  return (
    <div style={{ padding: 16 }}>
      <RechartsLineChart width={300} height={200} data={ROWS}>
        <RechartsXAxis dataKey="day" tick={{ fontSize: 10 }} />
        <RechartsYAxis tick={{ fontSize: 10 }} width={28} />
        <Line
          type="monotone"
          dataKey="p95"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </RechartsLineChart>
    </div>
  );
}

function CleanStaticLine(): ReactElement {
  return (
    <div style={{ padding: 16 }}>
      <ChartContainer theme={cleanTheme} mode="static" height={200} width="100%">
        <LineChart
          categories={DAYS}
          series={[{ name: "p95", data: LATENCY }]}
          fill
        />
      </ChartContainer>
    </div>
  );
}

function StudioStaticLine(): ReactElement {
  return (
    <div style={{ padding: 16 }}>
      <StudioLineChart
        title=""
        labels={DAYS}
        data={LATENCY}
        name="p95"
        height={200}
      />
    </div>
  );
}

function RechartsBareBar(): ReactElement {
  return (
    <div style={{ padding: 16 }}>
      <RechartsBarChart width={300} height={200} data={ROWS}>
        <RechartsXAxis dataKey="day" tick={{ fontSize: 10 }} />
        <RechartsYAxis tick={{ fontSize: 10 }} width={28} />
        <Bar dataKey="throughput" fill="#3b82f6" radius={[4, 4, 0, 0]} />
      </RechartsBarChart>
    </div>
  );
}

function CleanStaticBar(): ReactElement {
  return (
    <div style={{ padding: 16 }}>
      <ChartContainer theme={cleanTheme} mode="static" height={200} width="100%">
        <BarChart
          categories={DAYS}
          series={[{ name: "throughput", data: THROUGHPUT }]}
        />
      </ChartContainer>
    </div>
  );
}

function StudioStaticBar(): ReactElement {
  return (
    <div style={{ padding: 16 }}>
      <StudioBarChart
        labels={DAYS}
        data={THROUGHPUT}
        name="throughput"
        height={200}
      />
    </div>
  );
}

function RechartsBareArea(): ReactElement {
  return (
    <div style={{ padding: 16 }}>
      <RechartsAreaChart width={300} height={200} data={ROWS}>
        <RechartsXAxis dataKey="day" tick={{ fontSize: 10 }} />
        <RechartsYAxis tick={{ fontSize: 10 }} width={28} />
        <Area
          type="monotone"
          dataKey="p95"
          stroke="#3b82f6"
          fill="#3b82f6"
          fillOpacity={0.2}
          strokeWidth={2}
          isAnimationActive={false}
        />
      </RechartsAreaChart>
    </div>
  );
}

function CleanStaticArea(): ReactElement {
  return (
    <div style={{ padding: 16 }}>
      <QuickLineChart
        labels={DAYS}
        data={LATENCY}
        height={200}
        fill
        theme={cleanTheme}
      />
    </div>
  );
}

function StudioStaticArea(): ReactElement {
  return (
    <div style={{ padding: 16 }}>
      <StudioLineChart
        labels={DAYS}
        data={LATENCY}
        height={200}
        fill
      />
    </div>
  );
}

function StudioComparison(): ReactElement {
  return (
    <div style={{ display: "grid", gap: 28, maxWidth: 1080 }}>
      <CompareRow
        leftLabel="Recharts · bare"
        centerLabel="cleanTheme · static"
        rightLabel="studioTheme · static"
        left={<RechartsBareLine />}
        center={<CleanStaticLine />}
        right={<StudioStaticLine />}
      />
      <CompareRow
        leftLabel="Recharts · bare bar"
        centerLabel="cleanTheme · static bar"
        rightLabel="studioTheme · static bar"
        left={<RechartsBareBar />}
        center={<CleanStaticBar />}
        right={<StudioStaticBar />}
      />
      <CompareRow
        leftLabel="Recharts · bare area"
        centerLabel="cleanTheme · static area"
        rightLabel="studioTheme · gradient area"
        left={<RechartsBareArea />}
        center={<CleanStaticArea />}
        right={<StudioStaticArea />}
      />
    </div>
  );
}

const meta = {
  title: "Charts/Studio",
  component: StudioComparison,
  parameters: {
    layout: "padded",
    backgrounds: { default: "light" },
    docs: {
      description: {
        component:
          "C134 studio themed SVG — editorial gradient polish vs Recharts bare and cleanTheme static defaults.",
      },
    },
  },
} satisfies Meta<typeof StudioComparison>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LineBarArea: Story = {
  render: () => <StudioComparison />,
};

export const StudioThemeTokens: Story = {
  render: () => (
    <div data-theme="studio" style={{ maxWidth: 480 }}>
      <StudioLineChart
        title="API p95 latency"
        labels={DAYS}
        data={LATENCY}
        name="p95"
      />
    </div>
  ),
};
