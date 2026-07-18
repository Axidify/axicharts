export type SeriesTone =
  | "default"
  | "info"
  | "success"
  | "warning"
  | "critical";

export const SERIES_PALETTE = [
  "#2563eb",
  "#0891b2",
  "#16a34a",
  "#d97706",
  "#7c3aed",
  "#db2777",
];

export const SERIES_COLORS: Record<SeriesTone, string> = {
  default: SERIES_PALETTE[0]!,
  info: "#0891b2",
  success: "#16a34a",
  warning: "#d97706",
  critical: "#dc2626",
};

export type PieSlice = {
  name: string;
  value: number;
  key?: string;
  color?: string;
  tone?: SeriesTone;
};

export type OhlcPoint = {
  open: number;
  high: number;
  low: number;
  close: number;
};

export type WaterfallItem = {
  name: string;
  value: number;
  isTotal?: boolean;
  tone?: SeriesTone;
};

export type HeatmapMatrix = {
  xCategories: string[];
  yCategories: string[];
  values: number[][];
};

export type CalendarHeatmapPoint = {
  date: string;
  value: number;
};

export type CalendarHeatmapData = {
  points: CalendarHeatmapPoint[];
  year?: number;
  range?: [string, string];
};
