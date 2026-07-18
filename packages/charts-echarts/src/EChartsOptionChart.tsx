"use client";

import { useMemo, type ReactElement } from "react";
import type { EChartsOption } from "echarts";
import type { ChartTheme } from "@axicharts/charts-theme";
import { withPresentationAnimation } from "./presentationAnimation";
import {
  useEChart,
  type EChartCursorEvent,
  type EChartItemHoverEvent,
} from "./useEChart";

export type EChartsOptionChartProps = {
  width: number;
  height: number;
  theme: ChartTheme;
  option: EChartsOption;
  categories?: string[];
  chartId?: string;
  syncIndex?: number | null;
  syncSourceId?: string | null;
  onSyncIndex?: (index: number | null) => void;
  animate?: boolean;
  mergeOption?: boolean;
  replaceMerge?: string[] | null;
  onCursor?: (event: EChartCursorEvent) => void;
  onItemHover?: (event: EChartItemHoverEvent) => void;
};

function optionHasExplicitAnimation(option: EChartsOption): boolean {
  return (
    option.animation === true ||
    (typeof option.animationDuration === "number" && option.animationDuration > 0)
  );
}

function withThemeBackground(
  option: EChartsOption,
  _theme: ChartTheme,
): EChartsOption {
  if (option.backgroundColor != null) {
    return option;
  }

  return {
    ...option,
    backgroundColor: "transparent",
  };
}

export function EChartsOptionChart({
  width,
  height,
  theme,
  option,
  categories,
  chartId,
  syncIndex,
  syncSourceId,
  onSyncIndex,
  animate = false,
  mergeOption,
  replaceMerge,
  onCursor,
  onItemHover,
}: EChartsOptionChartProps): ReactElement {
  const resolvedOption = useMemo(() => {
    const themed = withThemeBackground(option, theme);
    if (optionHasExplicitAnimation(themed)) {
      return themed;
    }
    return withPresentationAnimation(themed, animate);
  }, [animate, option, theme]);

  const rootRef = useEChart({
    option: resolvedOption,
    width,
    height,
    categories,
    chartId,
    syncIndex,
    syncSourceId,
    onSyncIndex,
    onCursor,
    onItemHover,
    mergeOption: mergeOption ?? !animate,
    replaceMerge,
  });

  return (
    <div
      ref={rootRef}
      className="axicharts-echarts"
      style={{ width, height, background: "transparent" }}
    />
  );
}
