import { createContext, useContext } from "react";
import type { ChartSize } from "@axicharts/charts-core";
import type { SeriesTone } from "@axicharts/charts-canvas";
import type { ChartTheme } from "@axicharts/charts-theme";
import type { ChartDataState } from "../state/types";
import type { LegendVariant, TooltipVariant } from "../chrome/chromeVariants";
import type { LiveAnimate } from "../motion/types";

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
  /** Live-mode wholesale replace crossfade — cartesian charts may override. */
  liveAnimate?: LiveAnimate;
  syncId?: string;
  /** When set, brush followers only mirror range from this leader syncId. */
  syncFollower?: string;
  dataState: ChartDataState;
  isStale: boolean;
  lastUpdatedAt?: number;
  staleAfterMs?: number;
  tagTones?: Record<string, SeriesTone>;
  legendVariant?: LegendVariant;
  tooltipVariant?: TooltipVariant;
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
