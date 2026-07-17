export type SeriesTone =
  | "default"
  | "info"
  | "success"
  | "warning"
  | "critical";

export const SERIES_COLORS: Record<SeriesTone, string> = {
  default: "#3b82f6",
  info: "#06b6d4",
  success: "#22c55e",
  warning: "#f59e0b",
  critical: "#ef4444",
};

export const SERIES_PALETTE = [
  "#3b82f6",
  "#06b6d4",
  "#22c55e",
  "#f59e0b",
  "#a855f7",
  "#ec4899",
];

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
