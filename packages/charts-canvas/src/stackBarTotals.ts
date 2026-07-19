export type StackBarTotal = {
  left: number;
  top: number;
  width: number;
  total: number;
};

export function recordStackBarTotal(
  totals: Map<number, StackBarTotal>,
  categoryIndex: number,
  left: number,
  top: number,
  width: number,
  value: number,
): void {
  const current = totals.get(categoryIndex);
  if (!current) {
    totals.set(categoryIndex, { left, top, width, total: value });
    return;
  }
  current.total += value;
  if (top < current.top) {
    current.top = top;
    current.left = left;
    current.width = width;
  }
}

export function drawStackBarTotals(
  ctx: CanvasRenderingContext2D,
  totals: Map<number, StackBarTotal>,
  valueSuffix: string,
  labelColor: string,
  formatValue: (value: number, suffix?: string) => string,
): void {
  if (totals.size === 0) return;

  ctx.save();
  ctx.fillStyle = labelColor;
  ctx.font = "10px ui-sans-serif, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";

  for (const entry of totals.values()) {
    const label = formatValue(entry.total, valueSuffix);
    const x = entry.left + entry.width / 2;
    const y = entry.top - 4;
    ctx.fillText(label, x, y);
  }

  ctx.restore();
}
