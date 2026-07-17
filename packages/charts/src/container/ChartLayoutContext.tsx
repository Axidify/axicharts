import { createContext, useContext } from "react";
import type { ChartSize } from "@axicharts/charts-core";
import type { SeriesTone } from "@axicharts/charts-canvas";
import type { ChartTheme } from "@axicharts/charts-theme";
import type { ChartDataState } from "../state/types";

export type ChartConfig = Record<
  string,
  {
    label?: string;
    color?: string;
    tone?: SeriesTone;
  }
>;

export type ChartLayoutContextValue = {
  size: ChartSize;
  ready: boolean;
  theme: ChartTheme;
  config?: ChartConfig;
  mode: "static" | "interactive" | "live" | "presentation";
  syncId?: string;
  dataState: ChartDataState;
  isStale: boolean;
  lastUpdatedAt?: number;
  staleAfterMs?: number;
  tagTones?: Record<string, SeriesTone>;
};

export const ChartLayoutContext = createContext<ChartLayoutContextValue | null>(
  null,
);

export function useChartLayout(): ChartLayoutContextValue {
  const ctx = useContext(ChartLayoutContext);
  if (!ctx) {
    throw new Error("useChartLayout must be used within ChartContainer");
  }
  return ctx;
}
