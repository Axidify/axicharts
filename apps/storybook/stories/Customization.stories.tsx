import type { ReactElement, ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  CartesianChart,
  ChartContainer,
  Legend,
  Line,
  LineChart,
  Bar,
  BarChart,
  Tooltip,
  XAxis,
  YAxis,
} from "@axicharts/charts";
import { cleanTheme, createTheme } from "@axicharts/charts-theme";

const WEEKS = ["W1", "W2", "W3", "W4", "W5", "W6"];
const REVENUE = [1_180_000, 1_260_000, 1_310_000, 1_295_000, 1_420_000, 1_480_000];

const ROWS = WEEKS.map((week, index) => ({
  week,
  p95: [182, 176, 194, 210, 188, 171][index]!,
  p50: [96, 92, 101, 108, 98, 90][index]!,
}));

const brandTheme = createTheme(cleanTheme, {
  name: "brand",
  font: { family: "Georgia, 'Times New Roman', serif", size: 13 },
  tokens: {
    palette: ["#7c3aed", "#0891b2", "#16a34a", "#d97706", "#db2777"],
    grid: "#e9e5f5",
    axis: "#6b5b95",
    alarmWarning: "#db2777",
  },
});

function Tile({ title, note, children }: { title: string; note: string; children: ReactNode }): ReactElement {
  return (
    <section>
      <header style={{ marginBottom: 8 }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{title}</h3>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b" }}>{note}</p>
      </header>
      {children}
    </section>
  );
}

function CustomizationWall(): ReactElement {
  return (
    <div
      style={{
        display: "grid",
        gap: 24,
        maxWidth: 960,
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        background: "#ffffff",
        padding: 16,
      }}
    >
      <Tile title="valueFormat + yDomain + yTickCount" note='valueFormat="compact", yDomain={[0, "auto"]}, yTickCount={5}'>
        <ChartContainer theme={cleanTheme} height={240} width="100%" mode="interactive">
          <LineChart
            categories={WEEKS}
            series={[{ name: "Revenue", data: REVENUE }]}
            fill
            valueFormat="compact"
            yDomain={[0, "auto"]}
            yTickCount={5}
          />
        </ChartContainer>
      </Tile>

      <Tile title="Formatter function" note="valueFormat={(v) => `$${(v / 1e6).toFixed(2)}M`}">
        <ChartContainer theme={cleanTheme} height={240} width="100%" mode="interactive">
          <BarChart
            categories={WEEKS}
            series={[{ name: "Revenue", data: REVENUE }]}
            showValues
            valueFormat={(value) => `$${(value / 1e6).toFixed(2)}M`}
          />
        </ChartContainer>
      </Tile>

      <Tile title="Brand theme" note="font: Georgia 13px · palette + alarmWarning tokens reach the band">
        <ChartContainer theme={brandTheme} height={240} width="100%" mode="interactive">
          <LineChart
            categories={WEEKS}
            series={[{ name: "Revenue", data: REVENUE }]}
            valueFormat="compact"
            thresholdBands={[{ min: 1_250_000, max: 1_350_000, label: "Review band", tone: "warning" }]}
          />
        </ChartContainer>
      </Tile>

      <Tile title="Composable chrome" note='<YAxis tickFormat={(v) => `${v} ms`} /> · <Tooltip variant="dense" /> · <Legend hidden />'>
        <ChartContainer theme={cleanTheme} height={240} width="100%" mode="interactive">
          <CartesianChart data={ROWS}>
            <XAxis dataKey="week" />
            <YAxis tickFormat={(value) => `${value} ms`} />
            <Bar dataKey="p50" name="p50" />
            <Line dataKey="p95" name="p95" />
            <Tooltip variant="dense" />
            <Legend hidden />
          </CartesianChart>
        </ChartContainer>
      </Tile>
    </div>
  );
}

const meta = {
  title: "Charts/Customization",
  component: CustomizationWall,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "5b customization surface — valueFormat / yDomain / yTickCount, theme typography and tone tokens, composable Tooltip / Legend props.",
      },
    },
  },
} satisfies Meta<typeof CustomizationWall>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Wall: Story = {
  render: () => <CustomizationWall />,
};
