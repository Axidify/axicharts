import type { PanelSpec } from "@axicharts/charts-spec";

export type RenderPanel = {
  title: string;
  panel: PanelSpec;
  rows: Record<string, unknown>[];
};

export type RenderScenario = {
  id: string;
  group: string;
  title: string;
  description: string;
  tags: string[];
  /** What to verify visually when reviewing this scenario. */
  checks: string[];
  panels: RenderPanel[];
  /** Default layout for this scenario (overridable in UI). */
  defaultLayout?: {
    columns?: number;
    chartHeight?: number;
    containerWidth?: number | "full";
  };
};

export type LayoutPreset = {
  id: string;
  label: string;
  columns: number;
  chartHeight: number;
  containerWidth: number | "full";
};

export const LAYOUT_PRESETS: LayoutPreset[] = [
  {
    id: "axiboard-tile",
    label: "Axiboard tile (~360px)",
    columns: 1,
    chartHeight: 280,
    containerWidth: 360,
  },
  {
    id: "axiboard-grid",
    label: "Axiboard 2-col grid",
    columns: 2,
    chartHeight: 280,
    containerWidth: 760,
  },
  {
    id: "wide",
    label: "Wide single column",
    columns: 1,
    chartHeight: 280,
    containerWidth: 640,
  },
  {
    id: "full",
    label: "Full width",
    columns: 1,
    chartHeight: 320,
    containerWidth: "full",
  },
];

function barPanel(
  title: string,
  xField: string,
  yField: string,
  yLabel?: string,
): PanelSpec {
  return {
    type: "cartesian",
    title,
    theme: "clean",
    mode: "static",
    encoding: {
      x: { field: xField, type: "nominal", label: xField },
      y: { field: yField, label: yLabel ?? yField },
    },
    marks: [{ type: "bar", field: yField, label: yLabel ?? yField, tone: "info" }],
    props: { showValues: true },
  };
}

const IOT_ROWS = [
  { Status: "Online", count: 3 },
  { Status: "Warning", count: 1 },
];

const IOT_DEVICES = [
  { Device: "DEV001", "Temperature (°C)": 24.8, "Battery (%)": 95, "Humidity (%)": 61 },
  { Device: "DEV002", "Temperature (°C)": 25.4, "Battery (%)": 91, "Humidity (%)": 58 },
  { Device: "DEV003", "Temperature (°C)": 31.7, "Battery (%)": 18, "Humidity (%)": 42 },
  { Device: "DEV004", "Temperature (°C)": 26.1, "Battery (%)": 87, "Humidity (%)": 56 },
];

export const RENDER_SCENARIOS: RenderScenario[] = [
  {
    id: "two-categories",
    group: "Categorical bars",
    title: "Two categories",
    description:
      "Sparse ordinal x-axis — bars should be centered with side padding, not pinned to chart edges.",
    tags: ["bar", "ordinal", "compact"],
    checks: [
      "Bars centered under Online and Warning",
      "No large empty band pushing bars to far left/right",
      "Warning label fully visible (not Warnin)",
    ],
    defaultLayout: { columns: 1, chartHeight: 280, containerWidth: 360 },
    panels: [
      {
        title: "Devices by status",
        panel: barPanel("Devices by status", "Status", "count"),
        rows: IOT_ROWS,
      },
    ],
  },
  {
    id: "four-device-ids",
    group: "Categorical bars",
    title: "Four device IDs",
    description: "Short categorical labels in a narrow dashboard tile.",
    tags: ["bar", "labels", "compact"],
    checks: [
      "DEV001–DEV004 labels not clipped",
      "Bar width uses most of each category slot",
      "Value labels readable above bars",
    ],
    defaultLayout: { columns: 1, chartHeight: 280, containerWidth: 360 },
    panels: [
      {
        title: "Temperature by device",
        panel: barPanel("Temperature by device", "Device", "Temperature (°C)"),
        rows: IOT_DEVICES,
      },
      {
        title: "Battery by device",
        panel: barPanel("Battery by device", "Device", "Battery (%)"),
        rows: IOT_DEVICES,
      },
    ],
  },
  {
    id: "long-labels",
    group: "Categorical bars",
    title: "Long category labels",
    description: "Ellipsis truncation when slot width is tight.",
    tags: ["bar", "labels", "truncation"],
    checks: [
      "Long labels truncate with ellipsis, not hard clip",
      "No overlap between adjacent labels",
    ],
    defaultLayout: { columns: 1, chartHeight: 280, containerWidth: 360 },
    panels: [
      {
        title: "Vendor names",
        panel: barPanel("Spend by vendor", "Vendor", "Spend"),
        rows: [
          { Vendor: "Acme Industrial Supply Co.", Spend: 4200 },
          { Vendor: "Northern Logistics Partners", Spend: 3100 },
          { Vendor: "Pacific Sensor Systems Ltd.", Spend: 2800 },
          { Vendor: "Metro Facilities Group", Spend: 1900 },
        ],
      },
    ],
  },
  {
    id: "many-categories",
    group: "Categorical bars",
    title: "Twelve months",
    description: "Higher category count — bars should stay evenly spaced without crowding.",
    tags: ["bar", "density"],
    checks: [
      "All month labels visible or sensibly truncated",
      "Bars neither too thin nor overlapping",
    ],
    defaultLayout: { columns: 1, chartHeight: 280, containerWidth: 640 },
    panels: [
      {
        title: "Monthly revenue",
        panel: barPanel("Monthly revenue", "Month", "Revenue"),
        rows: [
          { Month: "Jan", Revenue: 42 },
          { Month: "Feb", Revenue: 38 },
          { Month: "Mar", Revenue: 51 },
          { Month: "Apr", Revenue: 47 },
          { Month: "May", Revenue: 55 },
          { Month: "Jun", Revenue: 49 },
          { Month: "Jul", Revenue: 58 },
          { Month: "Aug", Revenue: 52 },
          { Month: "Sep", Revenue: 61 },
          { Month: "Oct", Revenue: 57 },
          { Month: "Nov", Revenue: 64 },
          { Month: "Dec", Revenue: 70 },
        ],
      },
    ],
  },
  {
    id: "single-category",
    group: "Categorical bars",
    title: "Single category",
    description: "Edge case with one bar — should be centered, not left-aligned.",
    tags: ["bar", "edge-case"],
    checks: ["Single bar centered in plot area", "Label visible below bar"],
    defaultLayout: { columns: 1, chartHeight: 280, containerWidth: 360 },
    panels: [
      {
        title: "Total warnings",
        panel: barPanel("Warnings", "Status", "count"),
        rows: [{ Status: "Warning", count: 1 }],
      },
    ],
  },
  {
    id: "iot-dashboard-grid",
    group: "Dashboard layouts",
    title: "IoT telemetry grid",
    description:
      "Reproduces the axiboard IoT sensor dashboard chart block — the layout that exposed the bar/label bugs.",
    tags: ["dashboard", "grid", "iot", "regression"],
    checks: [
      "2×2 grid at ~760px container width",
      "Status chart: 2 bars centered, Warning label intact",
      "Device charts: DEV004 not clipped to DEV00",
      "Consistent bar width across all four panels",
    ],
    defaultLayout: { columns: 2, chartHeight: 280, containerWidth: 760 },
    panels: [
      {
        title: "Devices by status",
        panel: barPanel("Devices by status", "Status", "count"),
        rows: IOT_ROWS,
      },
      {
        title: "Temperature by device",
        panel: barPanel("Temperature by device", "Device", "Temperature (°C)"),
        rows: IOT_DEVICES,
      },
      {
        title: "Battery by device",
        panel: barPanel("Battery by device", "Device", "Battery (%)"),
        rows: IOT_DEVICES,
      },
      {
        title: "Humidity by device",
        panel: barPanel("Humidity by device", "Device", "Humidity (%)"),
        rows: IOT_DEVICES,
      },
    ],
  },
  {
    id: "combo-bar-line",
    group: "Mixed marks",
    title: "Bar + line combo",
    description: "Dual-series cartesian panel in a compact tile.",
    tags: ["combo", "bar", "line"],
    checks: [
      "Bar and line share x-axis without label clash",
      "Legend or series distinguishable at 280px height",
    ],
    defaultLayout: { columns: 1, chartHeight: 280, containerWidth: 360 },
    panels: [
      {
        title: "Weekly throughput",
        panel: {
          type: "combo",
          title: "Weekly throughput",
          theme: "clean",
          mode: "static",
          encoding: {
            x: { field: "week", type: "nominal" },
            y: [
              { field: "total", label: "Weekly total", kind: "bar" },
              { field: "avg", label: "Daily avg", kind: "line" },
            ],
          },
          props: { showValues: true },
        },
        rows: [
          { week: "W1", total: 120, avg: 17 },
          { week: "W2", total: 90, avg: 13 },
          { week: "W3", total: 150, avg: 21 },
          { week: "W4", total: 110, avg: 16 },
        ],
      },
    ],
  },
];

export const SCENARIO_GROUPS = [...new Set(RENDER_SCENARIOS.map((scenario) => scenario.group))];

export function findScenario(id: string): RenderScenario {
  const scenario = RENDER_SCENARIOS.find((item) => item.id === id);
  if (!scenario) {
    return RENDER_SCENARIOS[0]!;
  }
  return scenario;
}
