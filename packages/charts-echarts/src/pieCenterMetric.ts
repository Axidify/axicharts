import type { ChartTheme } from "@axicharts/charts-theme";
import { resolveChartChrome } from "@axicharts/charts-theme";
import type { ChartGraphicElement } from "@axicharts/charts-canvas";
import { echartsColor } from "./echartsColor";
import { isCompactTile } from "./themeBridge";
import { pieCenter, type PieLabelMode } from "./pieLayout";
import type { PieSlice } from "./types";

export type PieCenterMetric = {
  value: string;
  label?: string;
};

export type PieCenterMetricInput = PieCenterMetric | "largest";

export function resolveLargestSliceMetric(slices: PieSlice[]): PieCenterMetric | undefined {
  if (slices.length === 0) return undefined;
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  if (total <= 0) return undefined;
  const largest = slices.reduce((best, slice) => (slice.value > best.value ? slice : best));
  return {
    value: `${Math.round((largest.value / total) * 100)}%`,
    label: largest.name,
  };
}

export function resolvePieCenterMetric(
  slices: PieSlice[],
  input: PieCenterMetricInput,
): PieCenterMetric | undefined {
  if (input === "largest") {
    return resolveLargestSliceMetric(slices);
  }
  if (!input.value) return undefined;
  return input;
}

export function pieCenterMetricGraphics(
  metric: PieCenterMetric,
  theme: ChartTheme,
  labelMode: PieLabelMode,
  width: number,
  height: number,
): ChartGraphicElement[] {
  const compact = isCompactTile(width, height);
  const chrome = resolveChartChrome(theme);
  const dark = theme.name === "live" || theme.name === "industrial";
  const [centerX, centerY] = pieCenter(labelMode);
  const valueColor = dark ? "#f8fafc" : "#0f172a";
  const labelColor = echartsColor(chrome.axis);
  const valueSize = compact ? 18 : 22;
  const labelSize = compact ? 10 : 11;
  const labelGap = compact ? 2 : 3;
  const hasLabel = Boolean(metric.label);
  const blockHeight = hasLabel ? valueSize + labelGap + labelSize : valueSize;
  const valueTop = -blockHeight / 2;

  const children: ChartGraphicElement[] = [
    {
      type: "text",
      left: "50%",
      top: valueTop,
      style: {
        text: metric.value,
        fill: valueColor,
        fontSize: valueSize,
        fontWeight: "700",
        textAlign: "center",
      },
      z: 10,
      id: "pie-center-value",
    },
  ];

  if (metric.label) {
    children.push({
      type: "text",
      left: "50%",
      top: valueTop + valueSize + labelGap,
      style: {
        text: metric.label,
        fill: labelColor,
        fontSize: labelSize,
        fontWeight: "500",
        textAlign: "center",
        opacity: 0.88,
      },
      z: 10,
      id: "pie-center-label",
    });
  }

  return [
    {
      type: "group",
      left: centerX,
      top: centerY,
      children,
      z: 10,
      id: "pie-center-metric",
    },
  ];
}
