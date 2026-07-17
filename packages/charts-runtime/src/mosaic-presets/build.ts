import type { ChartMode, TemplateId, ThemeName } from "@axicharts/charts-spec";
import type { BoundDataSourceSpec, MosaicWallSpec } from "../types";
import type { MosaicPresetId } from "../mosaicPresetMeta";

const CATEGORIES = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00"];

const OPS_STATIC = {
  categories: CATEGORIES,
  cells: [
    { title: "CPU", data: [22, 28, 31, 34, 30, 34, 32], suffix: "%" },
    { title: "Memory", data: [55, 58, 60, 59, 61, 62, 61], suffix: "%" },
    { title: "Errors", data: [1, 2, 5, 3, 2, 4, 3], suffix: "/min", tone: "warning" },
    { title: "p95", data: [42, 38, 55, 49, 62, 58, 71], suffix: "ms" },
  ],
};

const FINANCE_STATIC = {
  kpis: [
    { value: "$1.33M", label: "Net revenue" },
    { value: "62.4%", label: "Gross margin", tone: "success" },
    { value: "+18%", label: "QoQ growth" },
  ],
  waterfall: [
    { name: "Q1", value: 1100000, isTotal: true },
    { name: "New ARR", value: 240000 },
    { name: "Churn", value: -80000, tone: "critical" },
    { name: "Q2", value: 1330000, isTotal: true },
  ],
  categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  revenue: [820, 932, 901, 1034, 1290, 1330],
};

const OVERVIEW_STATIC = {
  kpis: [
    { value: "98.2%", label: "Uptime" },
    { value: "1.2k", label: "Units/hr" },
  ],
  categories: ["08:00", "09:00", "10:00", "11:00", "12:00"],
  series: [{ name: "Throughput", data: [980, 1020, 1100, 1180, 1210] }],
};

const TRADING_STATIC = {
  kpis: [
    { value: "$184.00", label: "Last" },
    { value: "+1.2%", label: "Day", tone: "success" },
    { value: "48", label: "RSI" },
    { value: "1.3M", label: "Volume" },
  ],
  categories: ["09:30", "10:00", "10:30", "11:00", "11:30", "12:00"],
  ohlc: [
    { open: 182.4, high: 183.2, low: 181.9, close: 182.8 },
    { open: 182.8, high: 184.1, low: 182.5, close: 183.6 },
    { open: 183.6, high: 183.9, low: 182.1, close: 182.4 },
    { open: 182.4, high: 185.0, low: 182.2, close: 184.7 },
    { open: 184.7, high: 185.4, low: 184.0, close: 184.2 },
    { open: 184.2, high: 184.8, low: 183.5, close: 184.0 },
  ],
  volume: [1_200_000, 1_800_000, 1_100_000, 2_400_000, 1_600_000, 1_300_000],
};

const PROGRAM_STATIC = {
  kpis: [
    { value: "34", label: "Points left", tone: "warning" },
    { value: "28", label: "Velocity", tone: "success" },
    { value: "92%", label: "On-time", tone: "info" },
  ],
  burndown: {
    categories: ["D1", "D2", "D3", "D4", "D5", "D6"],
    remaining: [120, 108, 96, 88, 74, 68],
    ideal: [120, 108, 96, 84, 72, 60],
  },
  velocity: {
    categories: ["S1", "S2", "S3", "S4"],
    done: [22, 26, 24, 28],
    carry: [6, 4, 5, 3],
  },
  status: {
    slices: [
      { name: "Done", value: 48, tone: "success" },
      { name: "In progress", value: 22, tone: "info" },
      { name: "Blocked", value: 6, tone: "critical" },
      { name: "Backlog", value: 34, tone: "default" },
    ],
  },
  funnel: {
    stages: [
      { name: "Ideas", value: 120 },
      { name: "Scoped", value: 84 },
      { name: "In dev", value: 52 },
      { name: "Shipped", value: 38 },
    ],
  },
  gantt: {
    tasks: [
      { name: "Discovery", start: 0, end: 4, progress: 1, tone: "success" },
      { name: "Build", start: 7, end: 16, progress: 0.55, tone: "info" },
      { name: "QA", start: 14, end: 18, progress: 0.1, tone: "warning" },
    ],
    milestones: [{ label: "Beta", at: 12, tone: "warning" }],
    today: 11,
  },
};

const CAPACITY_STATIC = {
  kpis: [
    { value: "78%", label: "CPU pool", tone: "warning" },
    { value: "64%", label: "Memory", tone: "success" },
    { value: "12", label: "Pending jobs" },
  ],
  gauges: [
    { value: 78, label: "Compute", warningAt: 70, criticalAt: 90 },
    { value: 64, label: "Storage", warningAt: 75, criticalAt: 92 },
    { value: 41, label: "Network", warningAt: 80, criticalAt: 95 },
  ],
  slices: [
    { name: "On-demand", value: 52 },
    { name: "Reserved", value: 31 },
    { name: "Spot", value: 17 },
  ],
  bar: {
    categories: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    values: [72, 78, 81, 76, 79],
  },
};

function staticSources(
  sources: BoundDataSourceSpec[],
): BoundDataSourceSpec[] {
  return sources;
}

function baseWall(
  preset: MosaicPresetId,
  options: {
    title?: string;
    subtitle?: string;
    theme?: ThemeName;
    mode?: ChartMode;
    columns?: number;
    cells: MosaicWallSpec["cells"];
    dataSources: BoundDataSourceSpec[];
    dataSourceId?: string;
  },
): MosaicWallSpec {
  return {
    version: "0.1",
    title: options.title,
    subtitle: options.subtitle,
    theme: options.theme ?? "industrial",
    mode: options.mode ?? "interactive",
    columns: options.columns ?? 2,
    gap: 12,
    staleAfterMs: 5000,
    dataSourceId: options.dataSourceId,
    dataSources: options.dataSources,
    data: {
      alarms: [{ id: "cpu-high", message: "CPU above warn threshold", severity: "warning" }],
    },
    cells: options.cells,
  };
}

export function buildMosaicPreset(
  preset: MosaicPresetId,
  options: {
    title?: string;
    subtitle?: string;
    theme?: ThemeName;
    mode?: ChartMode;
  } = {},
): MosaicWallSpec {
  switch (preset) {
    case "ops-finance":
      return baseWall(preset, {
        title: options.title ?? "Packaging Line 3",
        subtitle: options.subtitle ?? "Ops telemetry · shift P&L",
        theme: options.theme,
        mode: options.mode,
        dataSourceId: "ops",
        dataSources: staticSources([
          { id: "ops", type: "static", data: OPS_STATIC },
          { id: "finance", type: "static", data: FINANCE_STATIC },
        ]),
        cells: [
          { id: "ops", template: "ops-2x2", title: "Line 3", dataSourceId: "ops" },
          {
            id: "finance",
            template: "finance-pnl",
            title: "Shift P&L",
            dataSourceId: "finance",
          },
        ],
      });
    case "ops-overview":
      return baseWall(preset, {
        title: options.title ?? "Line 3 command",
        subtitle: options.subtitle ?? "Ops wall · throughput overview",
        theme: options.theme,
        mode: options.mode,
        dataSourceId: "ops",
        dataSources: staticSources([
          { id: "ops", type: "static", data: OPS_STATIC },
          { id: "overview", type: "static", data: OVERVIEW_STATIC },
        ]),
        cells: [
          { id: "ops", template: "ops-2x2", title: "Line 3", dataSourceId: "ops" },
          {
            id: "overview",
            template: "line-overview",
            title: "Throughput",
            dataSourceId: "overview",
          },
        ],
      });
    case "trading-program":
      return baseWall(preset, {
        title: options.title ?? "Trading · program",
        subtitle: options.subtitle ?? "Desk blotter · sprint command",
        theme: options.theme ?? "live",
        mode: options.mode,
        columns: 2,
        dataSourceId: "trading",
        dataSources: staticSources([
          { id: "trading", type: "static", data: TRADING_STATIC },
          { id: "program", type: "static", data: PROGRAM_STATIC },
        ]),
        cells: [
          {
            id: "trading",
            template: "trading-blotter",
            title: "Desk",
            dataSourceId: "trading",
            theme: "live",
          },
          {
            id: "program",
            template: "program-dashboard",
            title: "Sprint",
            dataSourceId: "program",
            theme: "clean",
          },
        ],
      });
    case "command-center":
      return baseWall(preset, {
        title: options.title ?? "Plant command",
        subtitle: options.subtitle ?? "Ops wall · capacity grid",
        theme: options.theme,
        mode: options.mode,
        columns: 2,
        dataSourceId: "ops",
        dataSources: staticSources([
          { id: "ops", type: "static", data: OPS_STATIC },
          { id: "capacity", type: "static", data: CAPACITY_STATIC },
        ]),
        cells: [
          { id: "ops", template: "ops-2x2", title: "Line 3", dataSourceId: "ops" },
          {
            id: "capacity",
            template: "capacity-grid",
            title: "Resources",
            dataSourceId: "capacity",
          },
        ],
      });
    default: {
      const exhaustive: never = preset;
      return exhaustive;
    }
  }
}

export function mosaicPresetTemplates(preset: MosaicPresetId): TemplateId[] {
  return buildMosaicPreset(preset).cells.map((cell) => cell.template);
}
