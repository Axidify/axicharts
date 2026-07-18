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
export function formatAxisCategoryLabel(label: string): string {
  const match = ISO_DATE.exec(label);
  if (!match) return label;

  const month = Number(match[2]);
  const day = Number(match[3]);
  const monthLabel = MONTH_ABBR[month - 1] ?? match[2];
  return `${monthLabel} ${day}`;
}

export function axisCategoryValues(
  categories: string[],
): (_u: unknown, ticks: number[]) => string[] {
  return (_u, ticks) =>
    ticks.map((tick) => formatAxisCategoryLabel(categories[tick] ?? ""));
}
