import type uPlot from "uplot";
import { parseRgbChannels, SERIES_COLORS, withAlpha } from "./colors";
import type {
  PlotLabelAnnotation,
  PlotMarkerAnnotation,
  PlotVerticalLine,
} from "./annotations";
import { categoryToIndex } from "./annotations";
import type { ReferenceLine, ThresholdBand } from "./types";

function contrastingTextColor(color: string): string {
  const channels = parseRgbChannels(color);
  if (!channels) return "#ffffff";
  const luminance =
    (0.299 * channels.r + 0.587 * channels.g + 0.114 * channels.b) / 255;
  return luminance > 0.62 ? "#0f172a" : "#ffffff";
}

function drawBandLabel(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  toneColor: string,
): void {
  ctx.font = "600 10px ui-sans-serif, system-ui, sans-serif";
  const metrics = ctx.measureText(text);
  const padX = 5;
  const padY = 3;
  const labelWidth = metrics.width + padX * 2;
  const labelHeight = 14;
  const labelX = x;
  const labelY = y - labelHeight + padY;

  ctx.fillStyle = withAlpha(toneColor, 0.92);
  if (typeof ctx.roundRect === "function") {
    ctx.beginPath();
    ctx.roundRect(labelX, labelY, labelWidth, labelHeight, 3);
    ctx.fill();
  } else {
    ctx.fillRect(labelX, labelY, labelWidth, labelHeight);
  }

  ctx.fillStyle = contrastingTextColor(toneColor);
  ctx.textBaseline = "middle";
  ctx.fillText(text, labelX + padX, labelY + labelHeight / 2);
  ctx.textBaseline = "alphabetic";
}

export function expandYRange(
  dataMin: number,
  dataMax: number,
  bands: ThresholdBand[],
  referenceLines: ReferenceLine[] = [],
  extraY: number[] = [],
): [number, number] {
  let min = dataMin;
  let max = dataMax;

  for (const band of bands) {
    min = Math.min(min, band.min, band.max);
    max = Math.max(max, band.min, band.max);
  }
  for (const line of referenceLines) {
    min = Math.min(min, line.value);
    max = Math.max(max, line.value);
  }
  for (const y of extraY) {
    min = Math.min(min, y);
    max = Math.max(max, y);
  }

  const span = max - min || Math.abs(max) || 1;
  const pad = span * 0.08;
  return [min - pad, max + pad];
}

export function drawThresholdBands(u: uPlot, bands: ThresholdBand[]): void {
  if (bands.length === 0) return;

  const ctx = u.ctx;
  const left = u.bbox.left;
  const width = u.bbox.width;

  for (const band of bands) {
    const low = Math.min(band.min, band.max);
    const high = Math.max(band.min, band.max);
    const yTop = u.valToPos(high, "y", true);
    const yBottom = u.valToPos(low, "y", true);
    const tone = band.tone ?? "warning";
    const color = SERIES_COLORS[tone];

    ctx.save();
    ctx.fillStyle = withAlpha(color, 0.14);
    ctx.fillRect(left, yTop, width, yBottom - yTop);
    ctx.strokeStyle = withAlpha(color, 0.4);
    ctx.lineWidth = 1;
    ctx.strokeRect(left, yTop, width, yBottom - yTop);

    if (band.label) {
      const bandHeight = yBottom - yTop;
      const labelY =
        bandHeight >= 22
          ? yTop + bandHeight / 2
          : Math.min(yBottom - 4, yTop + 14);
      drawBandLabel(ctx, band.label, left + 6, labelY, color);
    }
    ctx.restore();
  }
}

export function drawReferenceLines(
  u: uPlot,
  referenceLines: ReferenceLine[],
): void {
  if (referenceLines.length === 0) return;

  const ctx = u.ctx;

  for (const line of referenceLines) {
    const y = u.valToPos(line.value, "y", true);
    const tone = line.tone ?? "warning";
    const stroke = SERIES_COLORS[tone];

    ctx.save();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(u.bbox.left, y);
    ctx.lineTo(u.bbox.left + u.bbox.width, y);
    ctx.stroke();
    ctx.setLineDash([]);

    if (line.label) {
      ctx.fillStyle = stroke;
      ctx.font = "11px ui-sans-serif, system-ui, sans-serif";
      const textWidth = ctx.measureText(line.label).width;
      ctx.fillText(
        line.label,
        u.bbox.left + u.bbox.width - textWidth,
        y - 5,
      );
    }
    ctx.restore();
  }
}

export function drawVerticalLines(
  u: uPlot,
  verticalLines: PlotVerticalLine[],
  categories: string[],
): void {
  if (verticalLines.length === 0) return;

  const ctx = u.ctx;

  for (const line of verticalLines) {
    const index = categoryToIndex(line.x, categories);
    if (index == null) continue;

    const x = u.valToPos(index, "x", true);
    const tone = line.tone ?? "info";
    const stroke = SERIES_COLORS[tone];

    ctx.save();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(x, u.bbox.top);
    ctx.lineTo(x, u.bbox.top + u.bbox.height);
    ctx.stroke();
    ctx.setLineDash([]);

    if (line.label) {
      ctx.fillStyle = stroke;
      ctx.font = "10px ui-sans-serif, system-ui, sans-serif";
      ctx.fillText(line.label, x + 4, u.bbox.top + 12);
    }
    ctx.restore();
  }
}

function labelOffset(
  position: PlotLabelAnnotation["position"],
): { dx: number; dy: number; align: CanvasTextAlign } {
  switch (position) {
    case "bottom":
      return { dx: 0, dy: 14, align: "center" };
    case "left":
      return { dx: -8, dy: 4, align: "right" };
    case "right":
      return { dx: 8, dy: 4, align: "left" };
    case "center":
      return { dx: 0, dy: 4, align: "center" };
    case "top":
    default:
      return { dx: 0, dy: -6, align: "center" };
  }
}

export function drawPlotLabels(
  u: uPlot,
  labels: PlotLabelAnnotation[],
  categories: string[],
): void {
  if (labels.length === 0) return;

  const ctx = u.ctx;

  for (const label of labels) {
    const index = categoryToIndex(label.x, categories);
    const x =
      index != null
        ? u.valToPos(index, "x", true)
        : u.bbox.left + u.bbox.width / 2;
    const y = u.valToPos(label.y, "y", true);
    const tone = label.tone ?? "default";
    const color = SERIES_COLORS[tone];
    const { dx, dy, align } = labelOffset(label.position);

    ctx.save();
    ctx.fillStyle = color;
    ctx.font = "11px ui-sans-serif, system-ui, sans-serif";
    ctx.textAlign = align;
    ctx.fillText(label.text, x + dx, y + dy);
    ctx.restore();
  }
}

export function drawPlotMarkers(
  u: uPlot,
  markers: PlotMarkerAnnotation[],
  categories: string[],
): void {
  const staticMarkers = markers.filter((marker) => !marker.draggable);
  if (staticMarkers.length === 0) return;

  const ctx = u.ctx;

  for (const marker of staticMarkers) {
    const index = categoryToIndex(marker.x, categories);
    if (index == null) continue;

    const x = u.valToPos(index, "x", true);
    const y = u.valToPos(marker.y, "y", true);
    const tone = marker.tone ?? "warning";
    const color = SERIES_COLORS[tone];

    ctx.save();
    ctx.fillStyle = color;
    ctx.strokeStyle = withAlpha(color, 0.35);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (marker.label) {
      ctx.fillStyle = color;
      ctx.font = "10px ui-sans-serif, system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(marker.label, x + 8, y + 4);
    }
    ctx.restore();
  }
}

export function createAnnotationDrawHook({
  bands,
  referenceLines,
  verticalLines = [],
  labels = [],
  markers = [],
  categories = [],
  onDraw,
}: {
  bands: ThresholdBand[];
  referenceLines: ReferenceLine[];
  verticalLines?: PlotVerticalLine[];
  labels?: PlotLabelAnnotation[];
  markers?: PlotMarkerAnnotation[];
  categories?: string[];
  onDraw?: (u: uPlot, seriesIdx: number) => void;
}): (u: uPlot, seriesIdx?: number) => void {
  return (u, seriesIdx) => {
    if (seriesIdx === 1) {
      drawThresholdBands(u, bands);
    }
    const onFinalPass =
      seriesIdx === undefined || seriesIdx === u.series.length - 1;
    if (onFinalPass) {
      drawReferenceLines(u, referenceLines);
      drawVerticalLines(u, verticalLines, categories);
      drawPlotLabels(u, labels, categories);
      drawPlotMarkers(u, markers, categories);
      onDraw?.(u, seriesIdx ?? u.series.length - 1);
    }
  };
}
