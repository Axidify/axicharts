import type { TemplateId, ThemeName, ChartMode } from "@axicharts/charts-spec";

export type VerticalGate = {
  id: string;
  title: string;
  subtitle: string;
  template: TemplateId;
  theme?: ThemeName;
  mode?: ChartMode;
  data: Record<string, unknown>;
};

const CATEGORIES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const VERTICAL_GATES: VerticalGate[] = [
  {
    id: "G",
    title: "G · Clean default",
    subtitle: "SaaS KPI + trend",
    template: "line-overview",
    theme: "clean",
    data: {
      kpis: [
        { value: "12.4k", label: "Active users" },
        { value: "+8.2%", label: "WoW growth", tone: "success" },
      ],
      categories: CATEGORIES,
      series: [{ name: "Signups", data: [820, 932, 901, 1034, 1290, 1330, 1320] }],
      weekly: { categories: ["W1", "W2", "W3", "W4"], values: [4200, 4800, 5100, 5400] },
    },
  },
  {
    id: "H",
    title: "H · Rich ops",
    subtitle: "Live 2×2 wall",
    template: "ops-2x2",
    theme: "industrial",
    mode: "live",
    data: {
      categories: CATEGORIES,
      cells: [
        { title: "CPU", data: [22, 28, 31, 34, 30, 34, 32], suffix: "%" },
        { title: "Memory", data: [55, 58, 60, 59, 61, 62, 61], suffix: "%" },
        { title: "Errors", data: [1, 2, 5, 3, 2, 4, 3], suffix: "/min", tone: "warning" },
        { title: "p95", data: [42, 38, 55, 49, 62, 58, 71], suffix: "ms" },
      ],
    },
  },
  {
    id: "I",
    title: "I · Detailed bars",
    subtitle: "Target vs actual",
    template: "line-overview",
    theme: "clean",
    data: {
      kpis: [{ value: "103%", label: "Target attainment" }],
      categories: ["Q1", "Q2", "Q3", "Q4"],
      series: [{ name: "Actual", data: [92, 98, 101, 103] }],
      weekly: { categories: ["T1", "T2", "T3", "T4"], values: [88, 94, 99, 103] },
    },
  },
  {
    id: "J",
    title: "J · Dual series",
    subtitle: "Correlated metrics",
    template: "line-overview",
    theme: "clean",
    data: {
      kpis: [
        { value: "0.82", label: "Correlation" },
        { value: "Stable", label: "Regime" },
      ],
      categories: CATEGORIES,
      series: [
        { name: "Throughput", data: [980, 1020, 1100, 1180, 1210, 1190, 1220] },
        { name: "Queue depth", data: [42, 38, 35, 48, 52, 49, 44] },
      ],
    },
  },
  {
    id: "K",
    title: "K · KPI + chart",
    subtitle: "Line overview",
    template: "line-overview",
    theme: "clean",
    data: {
      kpis: [
        { value: "98.2%", label: "Uptime" },
        { value: "1.2k", label: "Units/hr" },
      ],
      categories: ["08:00", "09:00", "10:00", "11:00", "12:00"],
      series: [{ name: "Throughput", data: [980, 1020, 1100, 1180, 1210] }],
    },
  },
  {
    id: "L",
    title: "L · Grid cells",
    subtitle: "Control-room density",
    template: "ops-2x2",
    theme: "industrial",
    mode: "live",
    data: {
      categories: CATEGORIES,
      cells: [
        { title: "Line A", data: [12, 14, 13, 16, 15, 17, 16], suffix: "u/s" },
        { title: "Line B", data: [9, 11, 10, 12, 11, 13, 12], suffix: "u/s" },
        { title: "Reject", data: [2, 3, 2, 4, 3, 2, 3], suffix: "%", tone: "warning" },
        { title: "OEE", data: [81, 83, 82, 85, 84, 86, 85], suffix: "%" },
      ],
    },
  },
  {
    id: "M",
    title: "M · Finance P&L",
    subtitle: "Waterfall + revenue",
    template: "finance-pnl",
    theme: "clean",
    data: {
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
    },
  },
  {
    id: "N",
    title: "N · Trading desk",
    subtitle: "OHLC + heatmap",
    template: "trading-blotter",
    theme: "live",
    mode: "live",
    data: {
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
      rsi: [38, 42, 35, 58, 52, 48],
      heatmap: {
        xCategories: ["Tech", "Energy", "Finance", "Health"],
        yCategories: ["Tech", "Energy", "Finance", "Health"],
        values: [
          [1.0, 0.42, 0.61, 0.38],
          [0.42, 1.0, 0.55, 0.29],
          [0.61, 0.55, 1.0, 0.47],
          [0.38, 0.29, 0.47, 1.0],
        ],
      },
    },
  },
  {
    id: "O",
    title: "O · Resource capacity",
    subtitle: "Gauges + utilization",
    template: "capacity-grid",
    theme: "clean",
    data: {
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
    },
  },
];
