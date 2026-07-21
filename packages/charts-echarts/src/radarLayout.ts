import { isCompactTile } from "./themeBridge";

export type RadarLayout = {
  compact: boolean;
  showLegend: boolean;
  center: [string, string];
  radius: string;
  startAngle: number;
  hideRadialLabels: boolean;
};

/** Recharts walks indicators clockwise from 12 o'clock; ECharts radar walks counter-clockwise. */
export function radarIndicatorOrder<T>(items: T[]): T[] {
  const n = items.length;
  if (n <= 1) return [...items];

  const ordered = new Array<T>(n);
  for (let index = 0; index < n; index += 1) {
    ordered[(n - index) % n] = items[index]!;
  }
  return ordered;
}

/** Recharts PolarAngleAxis starts at 12 o'clock and walks clockwise. */
export function resolveRadarLayout(
  width: number,
  height: number,
  seriesCount: number,
): RadarLayout {
  const compact = isCompactTile(width, height);
  const showLegend = seriesCount > 1;

  return {
    compact,
    showLegend,
    center: showLegend ? ["50%", "46%"] : ["50%", "52%"],
    radius: compact ? "54%" : width < 320 ? "58%" : "66%",
    startAngle: 90,
    hideRadialLabels: compact,
  };
}
