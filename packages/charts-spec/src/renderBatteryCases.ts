import type { PanelSpec } from "./types";
import type { RenderBatteryCase } from "./renderBattery";
import areaSloSpec from "../examples/area-slo-line.panel.json";
import browserShareDonutSpec from "../examples/browser-share-donut.panel.json";
import burndownSpec from "../examples/burndown-multi-line.panel.json";
import calendarSpec from "../examples/calendar-activity.panel.json";
import comboSpec from "../examples/combo-revenue-bar-line.panel.json";
import deviceTableSpec from "../examples/device-readings-table.panel.json";
import kpiSpec from "../examples/kpi-success-rate.panel.json";
import revenueLineSpec from "../examples/revenue-line.panel.json";
import stackedBar4Spec from "../examples/velocity-stacked-bar-4.panel.json";
import stackedBarSpec from "../examples/velocity-stacked-bar.panel.json";
import throughputSpec from "../examples/throughput-bar-color.panel.json";
import violinSpec from "../examples/violin-latency.panel.json";
import swarmSpec from "../examples/swarm-latency.panel.json";
import { DEFAULT_PLUGINS_WALL_PANELS } from "./pluginsWallData";

const TILE_W = 360;
const TILE_H = 280;
const COMPACT_H = 140;
const KPI_H = 72;

const REVENUE_ROWS = [
  { day: "Mon", revenue: 4200 },
  { day: "Tue", revenue: 3800 },
  { day: "Wed", revenue: 5100 },
  { day: "Thu", revenue: 4600 },
  { day: "Fri", revenue: 5900 },
];

const THROUGHPUT_ROWS = [
  { week: "W1", throughput: 120, aboveTarget: true },
  { week: "W2", throughput: 90, aboveTarget: false },
  { week: "W3", throughput: 150, aboveTarget: true },
  { week: "W4", throughput: 110, aboveTarget: false },
];

const LATENCY_ROWS = [
  { day: "Mon", latency: 42, meets_slo: true },
  { day: "Tue", latency: 58, meets_slo: false },
  { day: "Wed", latency: 35, meets_slo: true },
  { day: "Thu", latency: 72, meets_slo: false },
  { day: "Fri", latency: 48, meets_slo: true },
];

const COMBO_ROWS = [
  { week: "W1", total: 120, avg: 17 },
  { week: "W2", total: 90, avg: 13 },
  { week: "W3", total: 150, avg: 21 },
  { week: "W4", total: 110, avg: 16 },
];

const BROWSER_ROWS = [
  { name: "Chrome", value: 48 },
  { name: "Safari", value: 28 },
  { name: "Firefox", value: 14 },
  { name: "Other", value: 10 },
];

const IOT_ROWS = [
  { Status: "Online", count: 3 },
  { Status: "Warning", count: 1 },
];

const IOT_DEVICES = [
  { Device: "DEV001", "Temperature (°C)": 24.8, "Battery (%)": 95 },
  { Device: "DEV002", "Temperature (°C)": 25.4, "Battery (%)": 91 },
  { Device: "DEV003", "Temperature (°C)": 31.7, "Battery (%)": 18 },
  { Device: "DEV004", "Temperature (°C)": 26.1, "Battery (%)": 87 },
];

const DEVICE_TABLE_ROWS = [
  { device: "DEV001", temp: "24.8", battery: "95%", status: "Online" },
  { device: "DEV003", temp: "31.7", battery: "18%", status: "Warning" },
];

const PRIORITY_ROWS = [
  { priority: "P1 – Critical", count: 12 },
  { priority: "P2 – High", count: 28 },
  { priority: "P3 – Medium", count: 45 },
  { priority: "P4 – Low", count: 19 },
];

const MONTHLY_ROWS = Array.from({ length: 12 }, (_, index) => ({
  Month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][index],
  Revenue: 38 + index * 3 + (index % 3) * 2,
}));

const LONG_LABEL_ROWS = [
  { Vendor: "Acme Industrial Supply Co.", Spend: 4200 },
  { Vendor: "Northern Logistics Partners", Spend: 3100 },
  { Vendor: "Pacific Sensor Systems Ltd.", Spend: 2800 },
];

const LATENCY_SAMPLE_ROWS = [
  { service: "API", latency_ms: 12 },
  { service: "API", latency_ms: 18 },
  { service: "API", latency_ms: 28 },
  { service: "DB", latency_ms: 30 },
  { service: "DB", latency_ms: 42 },
];

const CALENDAR_ROWS = [
  { date: "2026-01-01", count: 2 },
  { date: "2026-01-02", count: 5 },
  { date: "2026-01-03", count: 1 },
  { date: "2026-01-04", count: 8 },
];

const HEATMAP_ROWS = [
  { hour: "09:00", day: "Mon", load: 0.42 },
  { hour: "10:00", day: "Mon", load: 0.55 },
  { hour: "09:00", day: "Tue", load: 0.38 },
  { hour: "10:00", day: "Tue", load: 0.61 },
];

const WATERFALL_ROWS = [
  { step: "Start", value: 100 },
  { step: "Revenue", value: 40 },
  { step: "Costs", value: -25 },
  { step: "End", value: 115 },
];

const FUNNEL_ROWS = [
  { stage: "Visit", value: 1000 },
  { stage: "Signup", value: 420 },
  { stage: "Paid", value: 180 },
];

const SCATTER_PANEL: PanelSpec = {
  specVersion: 1,
  type: "scatter",
  theme: "clean",
  mode: "static",
  height: TILE_H,
  width: TILE_W,
  encoding: {
    x: { field: "risk", type: "quantitative" },
    y: { field: "return", type: "quantitative" },
    color: { field: "name", type: "nominal" },
  },
};

const SCATTER_ROWS = [
  { name: "AAPL", risk: 0.22, return: 0.18 },
  { name: "NVDA", risk: 0.41, return: 0.52 },
  { name: "PG", risk: 0.12, return: 0.07 },
];

const RADAR_PANEL: PanelSpec = {
  specVersion: 1,
  type: "radar",
  theme: "clean",
  mode: "static",
  height: TILE_H,
  width: TILE_W,
  props: {
    indicators: [
      { name: "Reliability", max: 100 },
      { name: "Latency", max: 100 },
      { name: "Throughput", max: 100 },
    ],
    series: [
      { name: "Current", values: [82, 74, 88] },
      { name: "Target", values: [90, 85, 92] },
    ],
  },
};

const HISTOGRAM_PANEL: PanelSpec = {
  specVersion: 1,
  type: "histogram",
  theme: "clean",
  mode: "static",
  height: TILE_H,
  width: TILE_W,
  props: {
    categories: ["0–50", "50–100", "100–200", "200+"],
    values: [42, 118, 256, 73],
  },
};

const PIE_PANEL: PanelSpec = {
  specVersion: 1,
  type: "pie",
  theme: "clean",
  encoding: {
    name: { field: "status", type: "nominal" },
    value: { field: "count", type: "quantitative" },
  },
  props: { showLabels: true },
};

const PIE_ROWS = [
  { status: "Open", count: 12 },
  { status: "In progress", count: 8 },
  { status: "Done", count: 24 },
];

const BLOCKS_PANEL: PanelSpec = {
  specVersion: 1,
  type: "cartesian",
  theme: "clean",
  mode: "static",
  encoding: { x: { field: "week" } },
  marks: [
    { mark: "bar", field: "revenue", label: "Revenue" },
    { mark: "line", field: "target", label: "Target", curve: "monotone" },
    { mark: "rule", value: 50, label: "Quota", tone: "warning" },
  ],
};

const BLOCKS_ROWS = [
  { week: "W1", revenue: 42, target: 48 },
  { week: "W2", revenue: 51, target: 48 },
  { week: "W3", revenue: 46, target: 48 },
];

const GAUGE_PANEL: PanelSpec = {
  type: "gauge",
  theme: "industrial",
  height: 120,
  width: 180,
  props: { value: 78, min: 0, max: 100, label: "OEE", unit: "%", warningAt: 75 },
};

const SINGLE_BAR_PANEL: PanelSpec = {
  type: "cartesian",
  theme: "clean",
  mode: "static",
  encoding: { x: { field: "Status", type: "nominal" } },
  marks: [{ type: "bar", field: "count", label: "Count" }],
};

const HORIZONTAL_PANEL: PanelSpec = {
  type: "cartesian",
  theme: "clean",
  mode: "static",
  orientation: "horizontal",
  encoding: {
    x: { field: "priority", type: "nominal" },
    color: { field: "priority", type: "nominal" },
  },
  marks: [{ type: "bar", field: "count", label: "Tickets" }],
};

const ZERO_BAR_PANEL: PanelSpec = {
  type: "cartesian",
  theme: "clean",
  mode: "static",
  encoding: { x: { field: "day", type: "nominal" } },
  marks: [{ type: "bar", field: "value", label: "Value" }],
};

const ZERO_BAR_ROWS = [
  { day: "Mon", value: 0 },
  { day: "Tue", value: 0 },
  { day: "Wed", value: 0 },
];

const ONE_POINT_LINE_PANEL: PanelSpec = {
  type: "line",
  theme: "clean",
  mode: "static",
  encoding: {
    x: { field: "day", type: "nominal" },
    y: { field: "value", type: "quantitative" },
  },
};

const ONE_POINT_ROWS = [{ day: "Mon", value: 42 }];

function tile(
  panel: PanelSpec,
  partial: Omit<RenderBatteryCase, "panel"> & { panel?: PanelSpec },
): RenderBatteryCase {
  return {
    panel,
    rows: partial.rows ?? [],
    width: partial.width ?? TILE_W,
    height: partial.height ?? TILE_H,
    expect: partial.expect,
    surface: partial.surface,
    registerPlugins: partial.registerPlugins,
    emptyStateOk: partial.emptyStateOk,
    id: partial.id,
    group: partial.group,
    description: partial.description,
  };
}

/** Curated edge-case render battery — mount + DOM surface checks. */
export function buildRenderBatteryCases(): RenderBatteryCase[] {
  const passCases: RenderBatteryCase[] = [
    tile(revenueLineSpec as PanelSpec, {
      id: "R01",
      group: "cartesian",
      description: "Revenue line @ 360×280",
      rows: REVENUE_ROWS,
      surface: "uplot",
      expect: "pass",
    }),
    tile(throughputSpec as PanelSpec, {
      id: "R02",
      group: "cartesian",
      description: "Semantic bar encoding.color",
      rows: THROUGHPUT_ROWS,
      surface: "uplot",
      expect: "pass",
    }),
    tile(areaSloSpec as PanelSpec, {
      id: "R03",
      group: "cartesian",
      description: "Area SLO segments",
      rows: LATENCY_ROWS,
      surface: "uplot",
      expect: "pass",
    }),
    tile(comboSpec as PanelSpec, {
      id: "R04",
      group: "cartesian",
      description: "Combo bar + line dual axis",
      rows: COMBO_ROWS,
      surface: "uplot",
      expect: "pass",
    }),
    tile(burndownSpec as PanelSpec, {
      id: "R05",
      group: "cartesian",
      description: "Multi-series burndown with fill",
      rows: [],
      surface: "uplot",
      expect: "pass",
    }),
    tile(stackedBarSpec as PanelSpec, {
      id: "R06",
      group: "cartesian",
      description: "Stacked velocity (2 series)",
      rows: [],
      surface: "uplot",
      expect: "pass",
    }),
    tile(stackedBar4Spec as PanelSpec, {
      id: "R07",
      group: "cartesian",
      description: "Stacked velocity (4 series ramp)",
      rows: [],
      surface: "uplot",
      expect: "pass",
    }),
    tile(HORIZONTAL_PANEL, {
      id: "R08",
      group: "cartesian",
      description: "Horizontal priority bar @ 360×280",
      rows: PRIORITY_ROWS,
      surface: "uplot",
      expect: "pass",
    }),
    tile(BLOCKS_PANEL, {
      id: "R09",
      group: "cartesian",
      description: "Agent blocks bar+line+rule",
      rows: BLOCKS_ROWS,
      surface: "uplot",
      expect: "pass",
    }),
    tile(SINGLE_BAR_PANEL, {
      id: "R10",
      group: "edge",
      description: "Single category bar — centered slot",
      rows: [{ Status: "Warning", count: 1 }],
      surface: "uplot",
      expect: "pass",
    }),
    tile(SINGLE_BAR_PANEL, {
      id: "R11",
      group: "edge",
      description: "Two sparse categories (IoT status)",
      rows: IOT_ROWS,
      surface: "uplot",
      expect: "pass",
    }),
    tile(
      {
        type: "cartesian",
        theme: "clean",
        mode: "static",
        encoding: { x: { field: "Vendor", type: "nominal" } },
        marks: [{ type: "bar", field: "Spend", label: "Spend" }],
      },
      {
        id: "R12",
        group: "edge",
        description: "Long category labels — truncation",
        rows: LONG_LABEL_ROWS,
        surface: "uplot",
        expect: "pass",
      },
    ),
    tile(
      {
        type: "cartesian",
        theme: "clean",
        mode: "static",
        encoding: { x: { field: "Month", type: "nominal" } },
        marks: [{ type: "bar", field: "Revenue", label: "Revenue" }],
      },
      {
        id: "R13",
        group: "edge",
        description: "Twelve month categories — density",
        rows: MONTHLY_ROWS,
        width: 640,
        surface: "uplot",
        expect: "pass",
      },
    ),
    tile(ZERO_BAR_PANEL, {
      id: "R14",
      group: "edge",
      description: "All-zero bar series — baseline plot + caption",
      rows: ZERO_BAR_ROWS,
      surface: "uplot",
      expect: "pass",
    }),
    tile(ONE_POINT_LINE_PANEL, {
      id: "R15",
      group: "edge",
      description: "Single-point line chart",
      rows: ONE_POINT_ROWS,
      surface: "uplot",
      expect: "pass",
    }),
    tile(
      {
        type: "cartesian",
        theme: "clean",
        mode: "static",
        encoding: { x: { field: "Device", type: "nominal" } },
        marks: [{ type: "bar", field: "Temperature (°C)", label: "Temp" }],
      },
      {
        id: "R16",
        group: "edge",
        description: "Four device IDs in narrow tile",
        rows: IOT_DEVICES,
        surface: "uplot",
        expect: "pass",
      },
    ),
    tile(browserShareDonutSpec as PanelSpec, {
      id: "R20",
      group: "distribution",
      description: "Donut browser share + center metric",
      rows: BROWSER_ROWS,
      surface: "echarts",
      expect: "pass",
    }),
    tile(PIE_PANEL, {
      id: "R21",
      group: "distribution",
      description: "Full pie (no hole) @ compact",
      rows: PIE_ROWS,
      surface: "echarts",
      expect: "pass",
    }),
    tile(violinSpec as PanelSpec, {
      id: "R22",
      group: "distribution",
      description: "Violin @ catalog height",
      rows: LATENCY_SAMPLE_ROWS,
      height: COMPACT_H,
      surface: "echarts",
      expect: "pass",
    }),
    tile(swarmSpec as PanelSpec, {
      id: "R23",
      group: "distribution",
      description: "Swarm @ catalog height",
      rows: LATENCY_SAMPLE_ROWS,
      height: COMPACT_H,
      surface: "echarts",
      expect: "pass",
    }),
    tile(
      {
        type: "funnel",
        theme: "clean",
        height: TILE_H,
        width: TILE_W,
        encoding: {
          stage: { field: "stage", type: "nominal" },
          value: { field: "value", type: "quantitative" },
        },
      },
      {
        id: "R24",
        group: "distribution",
        description: "Funnel stages",
        rows: FUNNEL_ROWS,
        surface: "echarts",
        expect: "pass",
      },
    ),
    tile(
      {
        type: "waterfall",
        theme: "clean",
        height: TILE_H,
        width: TILE_W,
        props: { showConnectors: true },
        encoding: {
          x: { field: "step", type: "nominal" },
          y: { field: "value", type: "quantitative" },
        },
      },
      {
        id: "R25",
        group: "financial",
        description: "IBCS waterfall bridge",
        rows: WATERFALL_ROWS,
        surface: "echarts",
        expect: "pass",
      },
    ),
    tile(
      {
        type: "heatmap",
        theme: "clean",
        height: TILE_H,
        width: TILE_W,
        encoding: {
          x: { field: "hour", type: "nominal" },
          y: { field: "day", type: "nominal" },
          value: { field: "load", type: "quantitative" },
        },
      },
      {
        id: "R26",
        group: "matrix",
        description: "Heatmap service load",
        rows: HEATMAP_ROWS,
        surface: "echarts",
        expect: "pass",
      },
    ),
    tile(calendarSpec as PanelSpec, {
      id: "R27",
      group: "matrix",
      description: "Calendar heatmap activity",
      rows: CALENDAR_ROWS,
      surface: "echarts",
      expect: "pass",
    }),
    tile(SCATTER_PANEL, {
      id: "R28",
      group: "matrix",
      description: "Scatter risk vs return",
      rows: SCATTER_ROWS,
      surface: "echarts",
      expect: "pass",
    }),
    tile(RADAR_PANEL, {
      id: "R29",
      group: "matrix",
      description: "Radar scorecard multi-series",
      rows: [],
      surface: "echarts",
      expect: "pass",
    }),
    tile(HISTOGRAM_PANEL, {
      id: "R30",
      group: "matrix",
      description: "Histogram bin chart",
      rows: [],
      surface: "echarts",
      expect: "pass",
    }),
    tile(
      {
        type: "sunburst",
        theme: "clean",
        height: COMPACT_H,
        width: 280,
        props: {
          nodes: [
            {
              name: "Equities",
              children: [
                { name: "US", value: 38 },
                { name: "Intl", value: 18 },
              ],
            },
          ],
        },
      },
      {
        id: "R31",
        group: "matrix",
        description: "Sunburst @ catalog size",
        rows: [],
        surface: "echarts",
        expect: "pass",
      },
    ),
    tile(kpiSpec as PanelSpec, {
      id: "R40",
      group: "kpi",
      description: "Stat strip @ 72px",
      rows: [],
      height: KPI_H,
      surface: "kpi",
      expect: "pass",
    }),
    tile(deviceTableSpec as PanelSpec, {
      id: "R41",
      group: "kpi",
      description: "Data table with status tones",
      rows: DEVICE_TABLE_ROWS,
      height: 320,
      surface: "table",
      expect: "pass",
    }),
    tile(GAUGE_PANEL, {
      id: "R50",
      group: "industrial",
      description: "Gauge @ 180×120 industrial tile",
      rows: [],
      width: 180,
      height: 120,
      surface: "any",
      expect: "pass",
    }),
    tile(
      {
        type: "digital",
        theme: "industrial",
        height: 120,
        width: 180,
        props: { value: 1428, unit: " rpm", label: "Line speed" },
      },
      {
        id: "R51",
        group: "industrial",
        description: "Digital readout industrial",
        rows: [],
        width: 180,
        height: 120,
        surface: "any",
        expect: "pass",
      },
    ),
    tile(
      {
        type: "liquid-fill",
        theme: "industrial",
        height: 120,
        width: 180,
        props: { value: 0.68, label: "Tank", tone: "info" },
      },
      {
        id: "R52",
        group: "industrial",
        description: "Liquid fill @ industrial tile",
        rows: [],
        width: 180,
        height: 120,
        surface: "echarts",
        expect: "pass",
      },
    ),
  ];

  for (const pluginPanel of DEFAULT_PLUGINS_WALL_PANELS) {
    passCases.push(
      tile(pluginPanel, {
        id: `R60-${pluginPanel.type}`,
        group: "plugins",
        description: `Community plugin: ${pluginPanel.type}`,
        rows: [],
        width: typeof pluginPanel.width === "number" ? pluginPanel.width : TILE_W,
        height: typeof pluginPanel.height === "number" ? pluginPanel.height : TILE_H,
        surface: "any",
        registerPlugins: true,
        expect: "pass",
      }),
    );
  }

  const negativeCases: RenderBatteryCase[] = [
    tile(
      {
        type: "cartesian",
        encoding: { x: { field: "week" } },
        marks: [],
      },
      {
        id: "R90",
        group: "negative",
        description: "Empty marks array — must not compile",
        rows: REVENUE_ROWS,
        expect: "compile_throw",
      },
    ),
    tile(
      {
        type: "matrix",
        encoding: {
          x: { field: "hour", type: "nominal" },
          y: { field: "day", type: "nominal" },
          value: { field: "load", type: "quantitative" },
        },
        marks: [{ type: "colorScale", field: "load" }],
      },
      {
        id: "R91",
        group: "negative",
        description: "Matrix colorScale without cell — must not compile",
        rows: HEATMAP_ROWS,
        expect: "compile_throw",
      },
    ),
    tile(
      {
        type: "distribution",
        encoding: {
          angle: { field: "share", type: "quantitative" },
          color: { field: "browser", type: "nominal" },
        },
        marks: [{ type: "donut", innerRadius: 42 }],
      },
      {
        id: "R92",
        group: "negative",
        description: "Distribution donut without arc — must not compile",
        rows: BROWSER_ROWS,
        expect: "compile_throw",
      },
    ),
    tile(
      {
        type: "cartesian",
        encoding: { x: { field: "missing_field" } },
        marks: [{ type: "bar", field: "also_missing" }],
      },
      {
        id: "R93",
        group: "negative",
        description: "Unknown row fields — must not compile",
        rows: REVENUE_ROWS,
        expect: "compile_throw",
      },
    ),
  ];

  return [...passCases, ...negativeCases];
}
