const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})/;

const MONTH_ABBR = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

/** Compact ISO dates for uPlot x-axis labels (avoids right-edge clipping). */
export function formatAxisCategoryLabel(label: string, maxWidthPx?: number): string {
  const match = ISO_DATE.exec(label);
  let text = match
    ? `${MONTH_ABBR[Number(match[2]) - 1] ?? match[2]} ${Number(match[3])}`
    : label;

  if (maxWidthPx == null || maxWidthPx <= 0 || text.length <= 3) {
    return text;
  }

  const maxChars = Math.max(3, Math.floor(maxWidthPx / 6.5));
  if (text.length <= maxChars) return text;
  if (maxChars <= 3) return text.slice(0, maxChars);
  return `${text.slice(0, maxChars - 1)}…`;
}

export function axisCategoryValues(
  categories: string[],
  plotWidth?: number,
): (_u: unknown, ticks: number[]) => string[] {
  const slotWidth =
    plotWidth && categories.length > 0 ? plotWidth / categories.length : undefined;
  return (_u, ticks) =>
    ticks.map((tick) =>
      formatAxisCategoryLabel(categories[tick] ?? "", slotWidth ? slotWidth - 8 : undefined),
    );
}
