import type uPlot from "uplot";
import { createAreaGradient } from "./colors";
import { resolveSeriesColor } from "./seriesColor";
import type { PlotSeries } from "./types";

const EMPTY_PATHS = (): null => null;

export function hasSegmentedFills(series: PlotSeries[]): boolean {
  return series.some((item) => item.fills && item.fills.length > 0);
}

export function hasPerPointSizes(series: PlotSeries[]): boolean {
  return series.some((item) => item.sizes && item.sizes.length > 0);
}

export function hasCustomLineDraw(series: PlotSeries[]): boolean {
  return hasSegmentedFills(series) || hasPerPointSizes(series);
}

type SegmentedDrawConfig = {
  strokeWidth: number;
  areaFill: boolean;
  fillOpacity: number;
  pointRadius: number;
};

function drawSegmentedSeries(
  u: uPlot,
  seriesIdx: number,
  seriesItem: PlotSeries,
  seriesColor: string,
  config: SegmentedDrawConfig,
): void {
  const ctx = u.ctx;
  const xData = u.data[0] as number[];
  const yData = u.data[seriesIdx] as (number | null)[];
  const baseline = u.bbox.top + u.bbox.height;
  const fills = seriesItem.fills;

  for (let index = 0; index < xData.length - 1; index++) {
    const y0 = yData[index];
    const y1 = yData[index + 1];
    if (y0 == null || y1 == null) continue;

    const x0 = u.valToPos(xData[index]!, "x", true);
    const y0p = u.valToPos(y0, "y", true);
    const x1 = u.valToPos(xData[index + 1]!, "x", true);
    const y1p = u.valToPos(y1, "y", true);
    const color = fills?.[index] ?? fills?.[0] ?? seriesColor;

    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = config.strokeWidth;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    if (config.areaFill) {
      ctx.beginPath();
      ctx.moveTo(x0, baseline);
      ctx.lineTo(x0, y0p);
      ctx.lineTo(x1, y1p);
      ctx.lineTo(x1, baseline);
      ctx.closePath();
      ctx.fillStyle = createAreaGradient(
        ctx,
        Math.min(y0p, y1p),
        baseline,
        color,
        config.fillOpacity,
      );
      ctx.fill();
    }

    ctx.beginPath();
    ctx.moveTo(x0, y0p);
    ctx.lineTo(x1, y1p);
    ctx.stroke();
    ctx.restore();
  }

  for (let index = 0; index < xData.length; index++) {
    const y = yData[index];
    if (y == null) continue;

    const color = fills?.[index] ?? fills?.[0] ?? seriesColor;
    const radius = seriesItem.sizes?.[index] ?? config.pointRadius;
    const x = u.valToPos(xData[index]!, "x", true);
    const yp = u.valToPos(y, "y", true);

    ctx.save();
    ctx.fillStyle = color;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, yp, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}

export function createSegmentedLineDrawHook(
  series: PlotSeries[],
  config: SegmentedDrawConfig,
): (u: uPlot) => void {
  const segmented = series
    .map((item, index) => ({
      seriesIdx: index + 1,
      item,
      color: item.color ?? resolveSeriesColor(item.tone, index),
    }))
    .filter(
      (entry) =>
        Boolean(entry.item.fills?.length) ||
        Boolean(entry.item.sizes?.length),
    );

  return (u: uPlot) => {
    for (const entry of segmented) {
      drawSegmentedSeries(
        u,
        entry.seriesIdx,
        entry.item,
        entry.color,
        config,
      );
    }
  };
}

export function createVariablePointDrawHook(
  series: PlotSeries[],
  defaultRadius: number,
): (u: uPlot) => void {
  const sized = series
    .map((item, index) => ({
      seriesIdx: index + 1,
      item,
      color: item.color ?? resolveSeriesColor(item.tone, index),
    }))
    .filter((entry) => Boolean(entry.item.sizes?.length));

  return (u: uPlot) => {
    const ctx = u.ctx;
    for (const entry of sized) {
      const xData = u.data[0] as number[];
      const yData = u.data[entry.seriesIdx] as (number | null)[];

      for (let index = 0; index < xData.length; index++) {
        const y = yData[index];
        if (y == null) continue;

        const radius = entry.item.sizes?.[index] ?? defaultRadius;
        const x = u.valToPos(xData[index]!, "x", true);
        const yp = u.valToPos(y, "y", true);

        ctx.save();
        ctx.fillStyle = entry.color;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, yp, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    }
  };
}

export function segmentedSeriesPaths(): uPlot.Series.PathBuilder {
  return EMPTY_PATHS;
}
