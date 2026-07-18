import { useRef, useState, type ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  ChartContainer,
  LineChart,
  Stat,
  downloadExport,
  exportChart,
  exportChartBatch,
} from "@axicharts/charts";
import { cleanTheme } from "@axicharts/charts-theme";

const CATEGORIES = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const VALUES = [42, 58, 51, 73, 66];

function ExportChartDemo(): ReactElement {
  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<HTMLDivElement>(null);
  const wallRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState("Click export to download PNG/SVG/PDF snapshots.");

  async function exportPanel(
    target: HTMLDivElement | null,
    format: "png" | "svg" | "pdf",
    filename: string,
  ) {
    if (!target) return;
    const result = await exportChart(target, { format, pixelRatio: 2 });
    downloadExport(result, filename);
    setStatus(`Exported ${filename} (${result.width}×${result.height} ${format.toUpperCase()}).`);
  }

  async function exportWall(format: "png" | "pdf", multiPage = false) {
    if (!wallRef.current) return;
    const panels = [
      ...wallRef.current.querySelectorAll<HTMLDivElement>("[data-export-panel]"),
    ];
    if (format === "pdf" && multiPage) {
      const result = await exportChartBatch(panels, { format: "pdf", multiPage: true });
      downloadExport(result, "mosaic-wall.pdf");
      setStatus(
        `Multi-page PDF exported (${result.pageCount ?? panels.length} pages, ${result.width}×${result.height}).`,
      );
      return;
    }
    const results = await exportChartBatch(panels, { format });
    results.forEach((result, index) => {
      downloadExport(result, `mosaic-panel-${index + 1}.${format}`);
    });
    setStatus(`Batch exported ${results.length} mosaic panels as ${format.toUpperCase()}.`);
  }

  return (
    <div style={{ display: "grid", gap: 16, maxWidth: 760 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button type="button" onClick={() => exportPanel(canvasRef.current, "png", "line-chart.png")}>
          Export line PNG
        </button>
        <button type="button" onClick={() => exportPanel(canvasRef.current, "svg", "line-chart.svg")}>
          Export line SVG
        </button>
        <button type="button" onClick={() => exportPanel(svgRef.current, "svg", "stat.svg")}>
          Export stat SVG
        </button>
        <button type="button" onClick={() => exportPanel(canvasRef.current, "pdf", "line-chart.pdf")}>
          Export line PDF
        </button>
        <button type="button" onClick={() => exportPanel(svgRef.current, "pdf", "stat.pdf")}>
          Export stat PDF
        </button>
        <button type="button" onClick={() => void exportWall("png")}>
          Batch export mosaic PNG
        </button>
        <button type="button" onClick={() => void exportWall("pdf")}>
          Batch export mosaic PDF
        </button>
        <button type="button" onClick={() => void exportWall("pdf", true)}>
          Multi-page mosaic PDF
        </button>
      </div>
      <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>{status}</p>
      <div ref={canvasRef} data-export-panel>
        <ChartContainer theme={cleanTheme} height={220} width="100%">
          <LineChart
            categories={CATEGORIES}
            series={[{ name: "Signups", data: VALUES, tone: "info" }]}
            fill
          />
        </ChartContainer>
      </div>
      <div ref={svgRef} data-export-panel>
        <ChartContainer theme={cleanTheme} height={120} width={220}>
          <Stat value="98.4%" label="Uptime" tone="success" surface="light" />
        </ChartContainer>
      </div>
      <div
        ref={wallRef}
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
      >
        <div data-export-panel>
          <ChartContainer theme={cleanTheme} height={160} width="100%">
            <LineChart
              categories={CATEGORIES}
              series={[{ name: "Revenue", data: VALUES }]}
            />
          </ChartContainer>
        </div>
        <div data-export-panel>
          <ChartContainer theme={cleanTheme} height={160} width="100%">
            <LineChart
              categories={CATEGORIES}
              series={[{ name: "Churn", data: VALUES.map((value) => 100 - value), tone: "warning" }]}
            />
          </ChartContainer>
        </div>
      </div>
    </div>
  );
}

const meta = {
  title: "Platform/ExportChart",
  component: ExportChartDemo,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "C95 exportChart — PNG/SVG/PDF export for canvas (uPlot/ECharts) and SVG KPI panels, plus batch mosaic export. PDF uses a lazy-loaded jspdf raster embed. Multi-page PDF (`multiPage: true`) combines mosaic panels into one document with per-page a11y titles.",
      },
    },
  },
} satisfies Meta<typeof ExportChartDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  render: () => <ExportChartDemo />,
};
