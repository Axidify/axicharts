import type uPlot from "uplot";
import type { LineCurve } from "@axicharts/charts-theme";
import { createAreaGradient } from "./colors";
import { fillAreaUnderSegment, monotoneTangents, strokeSegment } from "./monotoneSegment";
import { resolveSeriesColor } from "./seriesColor";
import type { ChartTheme } from "@axicharts/charts-theme";
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
  curve: LineCurve;
};

function collectPixelPoints(
  u: uPlot,
  xData: number[],
  yData: (number | null)[],
): { points: { x: number; y: number }[]; valid: boolean[] } {
  const points: { x: number; y: number }[] = [];
  const valid: boolean[] = [];

  for (let index = 0; index < xData.length; index++) {
    const y = yData[index];
    if (y == null) {
      valid.push(false);
      points.push({ x: 0, y: 0 });
      continue;
    }
    valid.push(true);
    points.push({
      x: u.valToPos(xData[index]!, "x", true),
      y: u.valToPos(y, "y", true),
    });
  }

  return { points, valid };
}

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
  const { points, valid } = collectPixelPoints(u, xData, yData);
  const tangents =
    config.curve === "monotone" ? monotoneTangents(points) : undefined;

  for (let index = 0; index < xData.length - 1; index++) {
    if (!valid[index] || !valid[index + 1]) continue;

    const p0 = points[index]!;
    const p1 = points[index + 1]!;
    const color = fills?.[index] ?? fills?.[0] ?? seriesColor;
    const m0 = tangents?.[index];
    const m1 = tangents?.[index + 1];

    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = config.strokeWidth;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    if (config.areaFill) {
      fillAreaUnderSegment(
        ctx,
        p0.x,
        p0.y,
        p1.x,
        p1.y,
        baseline,
        config.curve,
        m0,
        m1,
      );
      ctx.fillStyle = createAreaGradient(
        ctx,
        Math.min(p0.y, p1.y),
        baseline,
        color,
        config.fillOpacity,
      );
      ctx.fill();
    }

    strokeSegment(ctx, p0.x, p0.y, p1.x, p1.y, config.curve, m0, m1);
    ctx.restore();
  }

  for (let index = 0; index < xData.length; index++) {
    if (!valid[index]) continue;

    const color = fills?.[index] ?? fills?.[0] ?? seriesColor;
    const radius = seriesItem.sizes?.[index] ?? config.pointRadius;
    const { x, y } = points[index]!;

    ctx.save();
    ctx.fillStyle = color;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}

export function createSegmentedLineDrawHook(
  series: PlotSeries[],
  config: SegmentedDrawConfig,
  theme?: Pick<ChartTheme, "tokens">,
): (u: uPlot) => void {
  const segmented = series
    .map((item, index) => ({
      seriesIdx: index + 1,
      item,
      color: item.color ?? resolveSeriesColor(item.tone, index, theme),
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
  theme?: Pick<ChartTheme, "tokens">,
): (u: uPlot) => void {
  const sized = series
    .map((item, index) => ({
      seriesIdx: index + 1,
      item,
      color: item.color ?? resolveSeriesColor(item.tone, index, theme),
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
