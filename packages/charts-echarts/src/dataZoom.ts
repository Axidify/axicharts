import type { ChartTheme } from "@axicharts/charts-theme";
import type { DataZoomComponentOption } from "echarts";

export type BuildDataZoomInput = {
  withVolume: boolean;
  theme: ChartTheme;
  /** Initial visible window end (%). Default 100 = full range. */
  end?: number;
};

function isDarkTheme(theme: ChartTheme): boolean {
  return theme.name === "live" || theme.name === "industrial";
}

export function buildDataZoom({
  withVolume,
  theme,
  end = 100,
}: BuildDataZoomInput): DataZoomComponentOption[] {
  const xAxisIndex = withVolume ? [0, 1] : [0];
  const dark = isDarkTheme(theme);

  return [
    {
      type: "inside",
      xAxisIndex,
      start: 0,
      end,
      filterMode: "filter",
    },
    {
      type: "slider",
      xAxisIndex,
      start: 0,
      end,
      bottom: 4,
      height: 18,
      borderColor: dark ? "#334155" : "#e2e8f0",
      fillerColor: dark
        ? "rgba(59, 130, 246, 0.25)"
        : "rgba(59, 130, 246, 0.15)",
      handleStyle: { color: dark ? "#94a3b8" : "#64748b" },
      textStyle: { color: dark ? "#94a3b8" : "#64748b", fontSize: 10 },
      dataBackground: {
        lineStyle: { color: dark ? "#475569" : "#cbd5e1" },
        areaStyle: { color: dark ? "#1e293b" : "#f1f5f9" },
      },
      brushSelect: true,
    },
  ];
}
