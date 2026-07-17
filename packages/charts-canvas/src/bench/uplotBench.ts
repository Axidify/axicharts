import uPlot from "uplot";
import { percentile } from "./math";
import { sinWaveMultiSeries, sinWaveSeries } from "./series";

export function createLinePlot(
  root: HTMLElement,
  pointCount: number,
  seriesCount = 1,
): uPlot {
  const seriesConfig: uPlot.Series[] = [{ width: 0 }];
  const data: uPlot.AlignedData =
    seriesCount === 1
      ? (() => {
          const { x, y } = sinWaveSeries(pointCount);
          seriesConfig.push({ stroke: "#3b82f6", width: 2 });
          return [x, y];
        })()
      : (() => {
          const { x, ys } = sinWaveMultiSeries(pointCount, seriesCount);
          const colors = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444"];
          for (let i = 0; i < seriesCount; i++) {
            seriesConfig.push({
              stroke: colors[i % colors.length],
              width: 2,
            });
          }
          return [x, ...ys];
        })();

  return new uPlot(
    {
      width: 320,
      height: 120,
      series: seriesConfig,
      axes: [{ show: false }, { show: false }],
      cursor: { show: false },
      legend: { show: false },
    },
    data,
    root,
  );
}

export function shiftSeries(data: uPlot.AlignedData): uPlot.AlignedData {
  const [x, ...rest] = data;
  const shifted = rest.map((series) => {
    const values = series as number[];
    const last = values[values.length - 1] ?? 0;
    const delta = (Math.random() - 0.5) * 2;
    return [...values.slice(1), Math.max(0, last + delta)];
  });
  return [x, ...shifted];
}

export async function flushFrames(): Promise<void> {
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
}

export async function measureUpdateP95(options: {
  panelCount: number;
  pointCount: number;
  seriesCount?: number;
  updateCount: number;
}): Promise<number> {
  const { panelCount, pointCount, seriesCount = 1, updateCount } = options;
  const roots: HTMLDivElement[] = [];
  const plots: uPlot[] = [];

  for (let i = 0; i < panelCount; i++) {
    const root = document.createElement("div");
    document.body.appendChild(root);
    roots.push(root);
    plots.push(createLinePlot(root, pointCount, seriesCount));
  }

  const frameTimes: number[] = [];

  for (let frame = 0; frame < updateCount; frame++) {
    const start = performance.now();
    for (const plot of plots) {
      plot.setData(shiftSeries(plot.data));
    }
    frameTimes.push(performance.now() - start);
  }

  await flushFrames();

  frameTimes.sort((a, b) => a - b);
  const p95 = percentile(frameTimes, 0.95);

  for (const plot of plots) plot.destroy();
  for (const root of roots) root.remove();

  return p95;
}
