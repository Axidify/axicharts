import { afterEach, describe, expect, it } from "vitest";
import uPlot from "uplot";
import { cleanTheme } from "@axicharts/charts-theme";
import type { ThresholdBand } from "./types";
import { buildLineOptions } from "./UPlotLine";
import { buildBarOptions } from "./UPlotBar";
import { buildComboOptions } from "./UPlotCombo";

// Regression: bands were only painted on a `seriesIdx === 1` pass, but the
// annotation hook is registered on uPlot's `draw` hook, which never receives a
// series index, so no band ever reached the canvas.

const categories = ["Mon", "Tue", "Wed", "Thu", "Fri"];
// Series values sit well below the band so sampled band pixels are clean.
const data = [10, 14, 12, 16, 13];
const band: ThresholdBand = { min: 80, max: 95, tone: "critical" };

const plots: uPlot[] = [];

afterEach(() => {
  while (plots.length > 0) plots.pop()!.destroy();
});

async function mount(
  options: uPlot.Options,
  seriesCount: number,
): Promise<uPlot> {
  const target = document.createElement("div");
  document.body.appendChild(target);
  const x = categories.map((_, index) => index);
  const plot = new uPlot(
    options,
    [x, ...Array.from({ length: seriesCount }, () => data)] as uPlot.AlignedData,
    target,
  );
  plots.push(plot);
  // uPlot commits its first paint on a microtask.
  await new Promise((resolve) => setTimeout(resolve, 0));
  return plot;
}

/** Share of pixels in a column through the band that carry the band's red tone. */
function bandCoverage(u: uPlot): number {
  const x = Math.round(u.bbox.left + u.bbox.width / 2);
  const yTop = Math.ceil(u.valToPos(band.max, "y", true)) + 2;
  const yBottom = Math.floor(u.valToPos(band.min, "y", true)) - 2;
  expect(yBottom).toBeGreaterThan(yTop);

  const pixels = u.ctx.getImageData(x, yTop, 1, yBottom - yTop).data;
  let tinted = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    const [r, g, b, a] = [pixels[i]!, pixels[i + 1]!, pixels[i + 2]!, pixels[i + 3]!];
    if (a > 0 && r > g + 60 && r > b + 60) tinted += 1;
  }
  return tinted / (pixels.length / 4);
}

function clearOutsideBand(u: uPlot): number {
  const x = Math.round(u.bbox.left + u.bbox.width / 2);
  const y = Math.round(u.valToPos(band.max, "y", true)) - 12;
  const [r, g, , a] = u.ctx.getImageData(x, y, 1, 1).data;
  return a === 0 || r! - g! < 60 ? 1 : 0;
}

describe("threshold bands render on the canvas", () => {
  it("line chart", async () => {
    const options = buildLineOptions({
      width: 360,
      height: 220,
      categories,
      series: [{ name: "Temp", data }],
      theme: cleanTheme,
      thresholdBands: [band],
    });
    const u = await mount(options, 1);
    expect(bandCoverage(u)).toBeGreaterThan(0.8);
    expect(clearOutsideBand(u)).toBe(1);
  });

  it("area chart", async () => {
    const options = buildLineOptions({
      width: 360,
      height: 220,
      categories,
      series: [{ name: "Temp", data }],
      theme: cleanTheme,
      fill: true,
      thresholdBands: [band],
    });
    const u = await mount(options, 1);
    expect(bandCoverage(u)).toBeGreaterThan(0.8);
  });

  it("combo chart", async () => {
    const options = buildComboOptions({
      width: 360,
      height: 220,
      categories,
      series: [
        { name: "Volume", kind: "bar", data },
        { name: "Trend", kind: "line", data },
      ],
      theme: cleanTheme,
      thresholdBands: [band],
      barLayoutsRef: { current: [] },
      stackTotalsRef: { current: new Map() },
    });
    const u = await mount(options, 2);
    expect(bandCoverage(u)).toBeGreaterThan(0.8);
  });

  it("bar chart", async () => {
    const options = buildBarOptions({
      width: 360,
      height: 220,
      categories,
      series: [{ name: "Count", data }],
      theme: cleanTheme,
      thresholdBands: [band],
      barLayoutsRef: { current: [] },
      stackTotalsRef: { current: new Map() },
    });
    const u = await mount(options, 1);
    expect(bandCoverage(u)).toBeGreaterThan(0.8);
  });

  it("paints bands before the series, not over them", () => {
    const options = buildLineOptions({
      width: 360,
      height: 220,
      categories,
      series: [{ name: "Temp", data }],
      theme: cleanTheme,
      thresholdBands: [band],
    });
    expect(options.hooks?.drawAxes).toHaveLength(1);
  });
});
