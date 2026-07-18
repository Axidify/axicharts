import { useRef, useState, type ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  ChartContainer,
  LineChart,
  BarChart,
  PieChart,
  CandlestickChart,
  HeatmapChart,
  FunnelChart,
  Stat,
  Gauge,
  downloadAccessibleTable,
  downloadExport,
  exportAccessibleChart,
  resolveChartA11y,
  buildChartA11yTable,
  type HeatmapMatrix,
} from "@axicharts/charts";
import { cleanTheme } from "@axicharts/charts-theme";

const CATEGORIES = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const VALUES = [42, 58, 51, 73, 66];

const PIE_SLICES = [
  { name: "Desktop", value: 48 },
  { name: "Mobile", value: 32 },
  { name: "Tablet", value: 20 },
];

const CANDLE_CATEGORIES = ["Mon", "Tue", "Wed"];
const CANDLE_DATA = [
  { open: 100, high: 108, low: 98, close: 105 },
  { open: 105, high: 110, low: 102, close: 103 },
  { open: 103, high: 106, low: 99, close: 101 },
];

const HEATMAP_MATRIX: HeatmapMatrix = {
  xCategories: ["9:00", "12:00", "15:00"],
  yCategories: ["A", "B"],
  values: [
    [0.2, 0.5, 0.8],
    [0.4, 0.6, 0.3],
  ],
};

const FUNNEL_STAGES = [
  { name: "Visit", value: 1000 },
  { name: "Signup", value: 420 },
  { name: "Purchase", value: 95 },
];

function AccessibilityExportDemo(): ReactElement {
  const canvasRef = useRef<HTMLDivElement>(null);
  const staticRef = useRef<HTMLDivElement>(null);
  const echartsRef = useRef<HTMLDivElement>(null);
  const hmiRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState(
    "Export accessible SVG or download the screen-reader data table fallback.",
  );
  const [tablePreview, setTablePreview] = useState("");

  async function exportAccessible(
    target: HTMLDivElement | null,
    format: "png" | "svg",
    filename: string,
  ) {
    if (!target) return;
    const result = await exportAccessibleChart(target, { format, pixelRatio: 2 });
    downloadExport(result, filename);
    const descriptor = resolveChartA11y(target);
    const rowCount = descriptor ? buildChartA11yTable(descriptor).rows.length : 0;
    setStatus(
      `Exported ${filename} with ${rowCount} data rows in a11y metadata.`,
    );
    setTablePreview(result.a11y?.tableHtml ?? "");
  }

  async function downloadTable(target: HTMLDivElement | null) {
    if (!target) return;
    const result = await exportAccessibleChart(target, { format: "png" });
    if (!result.a11y) return;
    downloadAccessibleTable(result.a11y, "chart-data.html");
    setStatus("Downloaded accessible data table HTML fallback.");
    setTablePreview(result.a11y.tableHtml);
  }

  return (
    <div style={{ display: "grid", gap: 16, maxWidth: 760 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => exportAccessible(canvasRef.current, "svg", "line-accessible.svg")}
        >
          Export canvas chart (SVG + a11y)
        </button>
        <button type="button" onClick={() => void downloadTable(canvasRef.current)}>
          Download data table fallback
        </button>
        <button
          type="button"
          onClick={() => exportAccessible(staticRef.current, "svg", "bar-static.svg")}
        >
          Export static SVG chart
        </button>
        <button
          type="button"
          onClick={() => exportAccessible(echartsRef.current, "png", "pie-accessible.png")}
        >
          Export ECharts pie (PNG + a11y)
        </button>
        <button type="button" onClick={() => void downloadTable(echartsRef.current)}>
          Download ECharts data table
        </button>
        <button
          type="button"
          onClick={() => exportAccessible(hmiRef.current, "svg", "gauge-accessible.svg")}
        >
          Export HMI panels (SVG + a11y)
        </button>
        <button type="button" onClick={() => void downloadTable(hmiRef.current)}>
          Download HMI data table
        </button>
      </div>
      <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>{status}</p>
      <div ref={canvasRef}>
        <ChartContainer theme={cleanTheme} height={220} width="100%">
          <LineChart
            categories={CATEGORIES}
            series={[{ name: "Signups", data: VALUES, tone: "info" }]}
          />
        </ChartContainer>
      </div>
      <div ref={staticRef}>
        <ChartContainer theme={cleanTheme} height={220} width="100%" mode="static">
          <BarChart
            categories={CATEGORIES}
            series={[{ name: "Revenue", data: VALUES }]}
            renderer="svg"
          />
        </ChartContainer>
      </div>
      <div ref={echartsRef} style={{ display: "grid", gap: 12 }}>
        <ChartContainer theme={cleanTheme} height={200} width="100%">
          <PieChart slices={PIE_SLICES} innerRadius={45} />
        </ChartContainer>
        <ChartContainer theme={cleanTheme} height={180} width="100%">
          <CandlestickChart categories={CANDLE_CATEGORIES} data={CANDLE_DATA} />
        </ChartContainer>
        <ChartContainer theme={cleanTheme} height={160} width="100%">
          <HeatmapChart matrix={HEATMAP_MATRIX} min={0} max={1} showLabels />
        </ChartContainer>
        <ChartContainer theme={cleanTheme} height={200} width="100%">
          <FunnelChart stages={FUNNEL_STAGES} />
        </ChartContainer>
      </div>
      <div
        ref={hmiRef}
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
        <ChartContainer theme={cleanTheme} height={140} width="100%">
          <Stat value="98.4%" label="Uptime" tone="success" />
        </ChartContainer>
        <ChartContainer theme={cleanTheme} height={140} width="100%">
          <Gauge value={72} label="Tank level" unit="%" warningAt={70} criticalAt={90} />
        </ChartContainer>
      </div>
      {tablePreview ? (
        <div
          style={{
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            padding: 12,
            fontSize: 12,
          }}
          dangerouslySetInnerHTML={{ __html: tablePreview }}
        />
      ) : null}
    </div>
  );
}

const meta = {
  title: "Platform/AccessibilityExport",
  component: AccessibilityExportDemo,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "C102–C105 accessibility export — SVG a11y tree on export, screen-reader data table fallback for canvas charts (cartesian + ECharts breadth) and single-value HMI panels (Stat, Gauge, Digital, StatusLamp).",
      },
    },
  },
} satisfies Meta<typeof AccessibilityExportDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  render: () => <AccessibilityExportDemo />,
};
