import uPlot from "uplot";
import { describe, expect, it } from "vitest";

const PANEL_COUNT = 6;
const POINT_COUNT = 2000;
const UPDATE_COUNT = 30;
const P95_BUDGET_MS = 16;

function percentile(sorted: number[], p: number): number {
  const index = Math.min(
    sorted.length - 1,
    Math.max(0, Math.ceil(sorted.length * p) - 1),
  );
  return sorted[index] ?? 0;
}

function createPlot(root: HTMLElement): uPlot {
  const x = Array.from({ length: POINT_COUNT }, (_, index) => index);
  const y = x.map((index) => 40 + Math.sin(index / 40) * 10);

  return new uPlot(
    {
      width: 320,
      height: 120,
      series: [{}, { stroke: "#3b82f6", width: 2 }],
      axes: [{ show: false }, { show: false }],
      cursor: { show: false },
      legend: { show: false },
    },
    [x, y],
    root,
  );
}

function shiftSeries(data: uPlot.AlignedData): uPlot.AlignedData {
  const [x, y] = data;
  const nextY = y as number[];
  const last = nextY[nextY.length - 1] ?? 0;
  const delta = (Math.random() - 0.5) * 2;
  return [x, [...nextY.slice(1), Math.max(0, last + delta)]];
}

describe("live panel perf", () => {
  const roots: HTMLDivElement[] = [];
  const plots: uPlot[] = [];

  it(`keeps ${PANEL_COUNT}-panel setData p95 under ${P95_BUDGET_MS}ms`, async () => {
    for (let i = 0; i < PANEL_COUNT; i++) {
      const root = document.createElement("div");
      document.body.appendChild(root);
      roots.push(root);
      plots.push(createPlot(root));
    }

    const frameTimes: number[] = [];

    for (let frame = 0; frame < UPDATE_COUNT; frame++) {
      const start = performance.now();
      for (const plot of plots) {
        plot.setData(shiftSeries(plot.data));
      }
      frameTimes.push(performance.now() - start);
    }

    await flushFrames();

    frameTimes.sort((a, b) => a - b);
    const p95 = percentile(frameTimes, 0.95);

    expect(p95).toBeLessThan(P95_BUDGET_MS);

    await flushFrames();
    for (const plot of plots.splice(0)) plot.destroy();
    for (const root of roots.splice(0)) root.remove();
  });
});

async function flushFrames(): Promise<void> {
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
}
