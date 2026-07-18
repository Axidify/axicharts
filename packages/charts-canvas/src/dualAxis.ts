import type { DualAxisMode, PlotSeries } from "./types";

function seriesSpan(data: number[]): number {
  if (data.length === 0) return 1;
  const max = Math.max(...data);
  const min = Math.min(...data);
  return max - min || max || 1;
}

export function shouldUseDualAxis(
  series: Pick<PlotSeries, "data">[],
  dualAxis: DualAxisMode = "auto",
): boolean {
  if (series.length < 2) return false;
  if (dualAxis === true) return true;
  if (dualAxis === false) return false;

  const spans = series.map((item) => seriesSpan(item.data));
  const hi = Math.max(...spans);
  const lo = Math.min(...spans);
  return hi / lo > 3;
}
