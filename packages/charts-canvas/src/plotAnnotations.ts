import type uPlot from "uplot";
import { SERIES_COLORS, withAlpha } from "./colors";
import type { ReferenceLine, ThresholdBand } from "./types";

export function expandYRange(
  dataMin: number,
  dataMax: number,
  bands: ThresholdBand[],
  referenceLines: ReferenceLine[] = [],
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
      ctx.fillStyle = color;
      ctx.font = "10px ui-sans-serif, system-ui, sans-serif";
      ctx.fillText(band.label, left + 6, yTop + 14);
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

export function createAnnotationDrawHook({
  bands,
  referenceLines,
  onDraw,
}: {
  bands: ThresholdBand[];
  referenceLines: ReferenceLine[];
  onDraw?: (u: uPlot, seriesIdx: number) => void;
}): (u: uPlot, seriesIdx: number) => void {
  return (u, seriesIdx) => {
    if (seriesIdx === 1) {
      drawThresholdBands(u, bands);
    }
    if (seriesIdx === u.series.length - 1) {
      drawReferenceLines(u, referenceLines);
      onDraw?.(u, seriesIdx);
    }
  };
}
