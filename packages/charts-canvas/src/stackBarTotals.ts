import type { BarOrientation } from "./types";

export type StackBarTotal = {
  left: number;
  top: number;
  width: number;
  height: number;
  total: number;
};

export function recordStackBarTotal(
  totals: Map<number, StackBarTotal>,
  categoryIndex: number,
  left: number,
  top: number,
  width: number,
  height: number,
  value: number,
  orientation: BarOrientation = "vertical",
): void {
  const current = totals.get(categoryIndex);
  if (!current) {
    totals.set(categoryIndex, { left, top, width, height, total: value });
    return;
  }
  current.total += value;
  if (orientation === "horizontal") {
    const right = left + width;
    const currentRight = current.left + current.width;
    if (right > currentRight) {
      current.left = left;
      current.top = top;
      current.width = width;
      current.height = height;
    }
    return;
  }
  if (top < current.top) {
    current.left = left;
    current.top = top;
    current.width = width;
    current.height = height;
  }
}

export function drawStackBarTotals(
  ctx: CanvasRenderingContext2D,
  totals: Map<number, StackBarTotal>,
  valueSuffix: string,
  labelColor: string,
  formatValue: (value: number, suffix?: string) => string,
  orientation: BarOrientation = "vertical",
): void {
  if (totals.size === 0) return;

  ctx.save();
  ctx.fillStyle = labelColor;
  ctx.font = "10px ui-sans-serif, system-ui, sans-serif";

  if (orientation === "horizontal") {
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    for (const entry of totals.values()) {
      const label = formatValue(entry.total, valueSuffix);
      const x = entry.left + entry.width + 4;
      const y = entry.top + entry.height / 2;
      ctx.fillText(label, x, y);
    }
  } else {
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    for (const entry of totals.values()) {
      const label = formatValue(entry.total, valueSuffix);
      const x = entry.left + entry.width / 2;
      const y = entry.top - 4;
      ctx.fillText(label, x, y);
    }
  }

  ctx.restore();
}
