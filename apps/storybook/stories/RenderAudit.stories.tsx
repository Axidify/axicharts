import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { compilePanel } from "@axicharts/charts-spec";

const IOT_ROWS = [
  { Status: "Online", count: 3 },
  { Status: "Warning", count: 1 },
];

const IOT_DEVICES = [
  { Device: "DEV001", "Temperature (°C)": 24.8 },
  { Device: "DEV002", "Temperature (°C)": 25.4 },
  { Device: "DEV003", "Temperature (°C)": 31.7 },
  { Device: "DEV004", "Temperature (°C)": 26.1 },
];

function TileGrid({ children }: { children: ReactElement[] }): ReactElement {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 360px))",
        gap: 16,
        maxWidth: 760,
      }}
    >
      {children}
    </div>
  );
}

function AuditTile({
  title,
  panel,
  rows,
  height = 280,
}: {
  title: string;
  panel: Parameters<typeof compilePanel>[0];
  rows: Record<string, unknown>[];
  height?: number;
}): ReactElement {
  return (
    <div style={{ minWidth: 0 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: "#64748b",
          marginBottom: 6,
        }}
      >
        {title}
      </div>
      <div style={{ width: 360, height }}>{compilePanel(panel, rows, { height })}</div>
    </div>
  );
}

const meta = {
  title: "Audit/Render",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Compact dashboard render audit — mirrors render-sandbox scenarios for visual CI.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const IotDashboardGrid: Story = {
  render: () => (
    <TileGrid>
      {[
        ["Devices by status", "Status", "count", IOT_ROWS],
        ["Temperature by device", "Device", "Temperature (°C)", IOT_DEVICES],
        ["Battery by device", "Device", "Battery (%)", IOT_DEVICES.map((row, index) => ({
          Device: row.Device,
          "Battery (%)": [95, 91, 18, 87][index],
        }))],
        ["Humidity by device", "Device", "Humidity (%)", IOT_DEVICES.map((row, index) => ({
          Device: row.Device,
          "Humidity (%)": [61, 58, 42, 56][index],
        }))],
      ].map(([title, xField, yField, rows]) => (
        <AuditTile
          key={String(title)}
          title={String(title)}
          rows={rows as Record<string, unknown>[]}
          panel={{
            type: "cartesian",
            title: String(title),
            theme: "clean",
            mode: "static",
            encoding: {
              x: { field: String(xField), type: "nominal", label: String(xField) },
              y: { field: String(yField), label: String(yField) },
            },
            marks: [
              {
                type: "bar",
                field: String(yField),
                label: String(yField),
                tone: "info",
              },
            ],
            props: { showValues: true },
          }}
        />
      ))}
    </TileGrid>
  ),
};

export const CompactPieTile: Story = {
  render: () => (
    <AuditTile
      title="Status mix"
      height={280}
      rows={IOT_ROWS}
      panel={{
        type: "pie",
        title: "Status mix",
        theme: "clean",
        mode: "static",
        encoding: {
          name: { field: "Status", type: "nominal" },
          value: { field: "count", type: "quantitative" },
        },
      }}
    />
  ),
};

export const StackedBarTotals: Story = {
  render: () => (
    <AuditTile
      title="Stacked throughput"
      rows={[
        { week: "W1", online: 80, warning: 20 },
        { week: "W2", online: 60, warning: 30 },
        { week: "W3", online: 90, warning: 10 },
      ]}
      panel={{
        type: "cartesian",
        title: "Stacked throughput",
        theme: "clean",
        mode: "static",
        encoding: {
          x: { field: "week", type: "nominal" },
          y: [
            { field: "online", label: "Online", kind: "bar" },
            { field: "warning", label: "Warning", kind: "bar" },
          ],
        },
        marks: [
          { type: "bar", field: "online", label: "Online", tone: "success" },
          { type: "bar", field: "warning", label: "Warning", tone: "warning" },
        ],
        props: { stacked: true, showValues: true },
      }}
    />
  ),
};

export const IndustrialPrimitives: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 160px)", gap: 16 }}>
      <AuditTile
        title="Digital"
        height={120}
        rows={[]}
        panel={{
          type: "digital",
          theme: "industrial",
          props: { value: 1428, unit: "rpm", label: "Spindle" },
        }}
      />
      <AuditTile
        title="Status lamp"
        height={120}
        rows={[]}
        panel={{
          type: "status-lamp",
          theme: "industrial",
          props: { status: "running", label: "Line 3" },
        }}
      />
      <AuditTile
        title="Tank"
        height={200}
        rows={[]}
        panel={{
          type: "tank",
          theme: "industrial",
          props: { level: 72, label: "Tank 7", warningAt: 75 },
        }}
      />
    </div>
  ),
};
