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
    id: "horizontal-priority",
    group: "Categorical bars",
    title: "Horizontal priority breakdown",
    description:
      "Long category labels in a narrow axiboard tile — planner/renderer horizontal bar path (D-101).",
    tags: ["bar", "horizontal", "labels", "design-audit"],
    checks: [
      "P1–P4 labels fully visible on the left axis",
      "Bars extend right with sensible left gutter",
      "No vertical label crowding or clipping at 360px",
    ],
    defaultLayout: { columns: 1, chartHeight: 280, containerWidth: 360 },
    panels: [
      {
        title: "Tickets by priority",
        panel: {
          type: "cartesian",
          title: "Tickets by priority",
          theme: "clean",
          mode: "static",
          orientation: "horizontal",
          encoding: {
            x: { field: "priority", type: "nominal", label: "Priority" },
            color: { field: "priority", type: "nominal" },
          },
          marks: [{ type: "bar", field: "count", label: "Tickets" }],
        },
        rows: [
          { priority: "P1 – Critical", count: 12 },
          { priority: "P2 – High", count: 28 },
          { priority: "P3 – Medium", count: 45 },
          { priority: "P4 – Low", count: 19 },
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
  {
    id: "dual-axis-combo",
    group: "Mixed marks",
    title: "Dual-axis combo",
    description:
      "Bar + line on separate y scales — overlay insets should align with right-axis padding.",
    tags: ["combo", "dual-axis", "regression"],
    checks: [
      "Right y-axis labels not clipped",
      "Bar and line both visible in 360px tile",
      "No overlay misalignment on graphics/markers",
    ],
    defaultLayout: { columns: 1, chartHeight: 280, containerWidth: 360 },
    panels: [
      {
        title: "Volume vs trend",
        panel: {
          type: "combo",
          title: "Volume vs trend",
          theme: "clean",
          mode: "static",
          encoding: {
            x: { field: "week", type: "nominal" },
            y: [
              { field: "total", label: "Weekly total", kind: "bar" },
              { field: "avg", label: "Daily avg", kind: "line" },
            ],
          },
          props: { dualAxis: true, showValues: true },
        },
        rows: [
          { week: "W1", total: 1200, avg: 17 },
          { week: "W2", total: 900, avg: 13 },
          { week: "W3", total: 1500, avg: 21 },
          { week: "W4", total: 1100, avg: 16 },
        ],
      },
    ],
  },
  {
    id: "bar-show-values",
    group: "Categorical bars",
    title: "Bar value labels",
    description: "showValues draws above bars — needs top padding so labels are not clipped.",
    tags: ["bar", "showValues", "regression"],
    checks: [
      "Numeric labels visible above each bar",
      "Labels not clipped by chart overflow",
    ],
    defaultLayout: { columns: 1, chartHeight: 280, containerWidth: 360 },
    panels: [
      {
        title: "Devices by status",
        panel: {
          ...barPanel("Devices by status", "Status", "count"),
          props: { showValues: true },
        },
        rows: IOT_ROWS,
      },
    ],
  },
  {
    id: "compact-bar-sparkline",
    group: "Compact layouts",
    title: "Compact bar (60px)",
    description: "Sparkline-height bar chart — axes hidden, plot uses full height.",
    tags: ["bar", "compact", "sparkline"],
    checks: [
      "No x/y axis chrome consuming height",
      "Bars fill the short plot area",
    ],
    defaultLayout: { columns: 1, chartHeight: 60, containerWidth: 200 },
    panels: [
      {
        title: "Status sparkline",
        panel: barPanel("Status sparkline", "Status", "count"),
        rows: IOT_ROWS,
      },
    ],
  },
  {
    id: "kpi-stat-strip",
    group: "Compact layouts",
    title: "KPI stat strip (72px)",
    description: "Matches PanelsDashboard KPI height — value and label should fit without overflow.",
    tags: ["stat", "kpi", "dashboard"],
    checks: [
      "Value, unit, and delta chip visible",
      "Font scales down for 72px height",
      "Long values like 31.7 do not clip",
    ],
    defaultLayout: { columns: 4, chartHeight: 72, containerWidth: 760 },
    panels: [
      {
        title: "Devices",
        panel: {
          type: "stat",
          title: "Devices",
          theme: "clean",
          mode: "static",
          props: {
            value: "4",
            label: "Devices",
            delta: "+1",
            deltaDirection: "up",
            surface: "light",
          },
        },
        rows: [],
      },
      {
        title: "Warnings",
        panel: {
          type: "stat",
          title: "Warnings",
          theme: "clean",
          mode: "static",
          props: {
            value: "1",
            label: "Warnings",
            tone: "warning",
            delta: "0",
            surface: "light",
          },
        },
        rows: [],
      },
      {
        title: "Avg temp",
        panel: {
          type: "stat",
          title: "Avg temp",
          theme: "clean",
          mode: "static",
          props: {
            value: "27.0",
            unit: "°C",
            label: "Avg temp",
            delta: "-1.2°C",
            deltaDirection: "down",
            surface: "light",
          },
        },
        rows: [],
      },
      {
        title: "Peak temp",
        panel: {
          type: "stat",
          title: "Peak temp",
          theme: "clean",
          mode: "static",
          props: {
            value: "31.7",
            unit: "°C",
            label: "Peak temp",
            tone: "warning",
            delta: "+4.1°C",
            deltaDirection: "up",
            surface: "light",
          },
        },
        rows: [],
      },
    ],
  },
  {
    id: "stacked-bar-totals",
    group: "Categorical bars",
    title: "Stacked bar totals",
    description: "Stacked bars with showValues — totals should render above each stack.",
    tags: ["bar", "stacked", "showValues", "regression"],
    checks: [
      "Total label above each stacked bar",
      "Segment labels hidden; only stack total shown",
      "Labels not clipped by overflow",
    ],
    defaultLayout: { columns: 1, chartHeight: 280, containerWidth: 360 },
    panels: [
      {
        title: "Weekly throughput",
        panel: {
          type: "cartesian",
          title: "Weekly throughput",
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
        },
        rows: [
          { week: "W1", online: 80, warning: 20 },
          { week: "W2", online: 60, warning: 30 },
          { week: "W3", online: 90, warning: 10 },
        ],
      },
    ],
  },
  {
    id: "pie-compact-tile",
    group: "ECharts compact",
    title: "Pie at 360px",
    description: "ECharts pie in axiboard tile width with compact grid margins.",
    tags: ["pie", "echarts", "compact"],
    checks: [
      "Slice labels not clipped at tile edge",
      "Chart centered in 360px tile",
    ],
    defaultLayout: { columns: 1, chartHeight: 280, containerWidth: 360 },
    panels: [
      {
        title: "Status mix",
        panel: {
          type: "pie",
          title: "Status mix",
          theme: "clean",
          mode: "static",
          encoding: {
            name: { field: "Status", type: "nominal" },
            value: { field: "count", type: "quantitative" },
          },
        },
        rows: IOT_ROWS,
      },
    ],
  },
  {
    id: "plugin-industrial",
    group: "Plugin charts",
    title: "Tank + andon",
    description: "Industrial plugin panels auto-registered via compilePanel.",
    tags: ["tank", "andon", "plugin"],
    checks: [
      "Tank level and label visible",
      "Andon station grid fits compact tile",
    ],
    defaultLayout: { columns: 2, chartHeight: 200, containerWidth: 760 },
    panels: [
      {
        title: "Tank level",
        panel: {
          type: "tank",
          title: "Tank level",
          theme: "industrial",
          props: { level: 68, label: "Tank 2", warningAt: 75 },
        },
        rows: [],
      },
      {
        title: "Line status",
        panel: {
          type: "andon",
          title: "Line status",
          theme: "industrial",
          props: {
            columns: 2,
            stations: [
              { id: "st-01", label: "Feeder", status: "ok" },
              { id: "st-02", label: "Filler", status: "warning", detail: "Low hopper" },
              { id: "st-03", label: "Capper", status: "ok" },
              { id: "st-04", label: "Inspector", status: "fault", detail: "Reject high" },
            ],
          },
        },
        rows: [],
      },
    ],
  },
  {
    id: "table-compact",
    group: "Compact layouts",
    title: "Table panel (320px)",
    description: "Device readings table at dashboard table height.",
    tags: ["table", "dashboard"],
    checks: [
      "Sticky header stays visible while scrolling",
      "Zebra rows aid scanability",
      "Numeric columns right-aligned with tabular nums",
    ],
    defaultLayout: { columns: 1, chartHeight: 320, containerWidth: 360 },
    panels: [
      {
        title: "Device readings",
        panel: {
          type: "table",
          title: "Device readings",
          theme: "clean",
          mode: "static",
          props: {
            compact: true,
            zebra: true,
            stickyHeader: true,
            surface: "light",
            columns: [
              { key: "Device", label: "Device ID", monospace: true },
              { key: "Temperature (°C)", label: "Temp °C", align: "right", monospace: true },
              { key: "Battery (%)", label: "Battery", align: "right", monospace: true },
              { key: "Status", label: "Status" },
            ],
          },
        },
        rows: [
          ...IOT_DEVICES.map((row) => ({
            Device: row.Device,
            "Temperature (°C)": row["Temperature (°C)"],
            "Battery (%)": row["Battery (%)"],
            Status: row.Device === "DEV003" ? "Warning" : "Online",
          })),
          { Device: "DEV005", "Temperature (°C)": 28.9, "Battery (%)": 72, Status: "Online" },
          { Device: "DEV006", "Temperature (°C)": 30.2, "Battery (%)": 64, Status: "Warning" },
          { Device: "DEV007", "Temperature (°C)": 23.6, "Battery (%)": 98, Status: "Online" },
          { Device: "DEV008", "Temperature (°C)": 27.8, "Battery (%)": 81, Status: "Online" },
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
