import type { PlotSeries } from "@axicharts/charts-canvas";

const PLOT_PAD = { top: 8, right: 8, bottom: 20, left: 36 };

export type PlotRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function plotRect(width: number, height: number): PlotRect {
  return {
    x: PLOT_PAD.left,
    y: PLOT_PAD.top,
    width: Math.max(1, width - PLOT_PAD.left - PLOT_PAD.right),
    height: Math.max(1, height - PLOT_PAD.top - PLOT_PAD.bottom),
  };
}

export function computeValueExtents(
  series: PlotSeries[],
  stacked = false,
): { min: number; max: number } {
  if (series.length === 0) {
    return { min: 0, max: 1 };
  }

  if (stacked) {
    const totals = series[0]!.data.map((_, index) =>
      series.reduce((sum, item) => sum + (item.data[index] ?? 0), 0),
    );
    const min = Math.min(0, ...totals);
    const max = Math.max(...totals, 1);
    return { min, max: max === min ? min + 1 : max };
  }

  const values = series.flatMap((item) => item.data);
  const min = Math.min(0, ...values);
  const max = Math.max(...values, 1);
  return { min, max: max === min ? min + 1 : max };
}

export function xAt(index: number, count: number, plot: PlotRect): number {
  if (count <= 1) return plot.x + plot.width / 2;
  return plot.x + (index / (count - 1)) * plot.width;
}

export function yAt(value: number, min: number, max: number, plot: PlotRect): number {
  const span = max - min || 1;
  return plot.y + plot.height - ((value - min) / span) * plot.height;
}

export function linePath(
  values: number[],
  min: number,
  max: number,
  plot: PlotRect,
): string {
  return values
    .map((value, index) => {
      const x = xAt(index, values.length, plot);
      const y = yAt(value, min, max, plot);
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

export function areaPath(
  values: number[],
  min: number,
  max: number,
  plot: PlotRect,
): string {
  if (values.length === 0) return "";
  const baseline = yAt(Math.max(min, 0), min, max, plot);
  const line = linePath(values, min, max, plot);
  const lastX = xAt(values.length - 1, values.length, plot);
  const firstX = xAt(0, values.length, plot);
  return `${line} L${lastX.toFixed(2)},${baseline.toFixed(2)} L${firstX.toFixed(2)},${baseline.toFixed(2)} Z`;
}
