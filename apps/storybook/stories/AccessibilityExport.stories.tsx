import { useRef, useState, type ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  ChartContainer,
  LineChart,
  BarChart,
  downloadAccessibleTable,
  downloadExport,
  exportAccessibleChart,
  resolveChartA11y,
  buildChartA11yTable,
} from "@axicharts/charts";
import { cleanTheme } from "@axicharts/charts-theme";

const CATEGORIES = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const VALUES = [42, 58, 51, 73, 66];

function AccessibilityExportDemo(): ReactElement {
  const canvasRef = useRef<HTMLDivElement>(null);
  const staticRef = useRef<HTMLDivElement>(null);
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
    downloadAccessibleTable(result.a11y, "line-chart-data.html");
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
          "C102 accessibility export — SVG a11y tree on export, screen-reader data table fallback for canvas charts.",
      },
    },
  },
} satisfies Meta<typeof AccessibilityExportDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  render: () => <AccessibilityExportDemo />,
};
