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

  it("draws band label text inside its pill", async () => {
    const options = buildLineOptions({
      width: 360,
      height: 220,
      categories,
      series: [{ name: "Temp", data }],
      theme: cleanTheme,
      showAxes: true,
      thresholdBands: [{ ...band, label: "Critical" }],
    });
    const u = await mount(options, 1);
    const yTop = u.valToPos(band.max, "y", true);
    const yBottom = u.valToPos(band.min, "y", true);
    const y = Math.round((yTop + yBottom) / 2 - 4);
    // drawBandLabel: pill at left + 6, text starts 5px further in.
    const x = Math.round(u.bbox.left + 11);
    const pixels = u.ctx.getImageData(x, y - 4, 30, 9).data;
    let textPixels = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i]! > 200 && pixels[i + 1]! > 200 && pixels[i + 2]! > 200) {
        textPixels += 1;
      }
    }
    expect(textPixels).toBeGreaterThan(5);
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

describe("threshold band tone colors", () => {
  it("come from the theme's tone tokens, not the fixed palette", async () => {
    const brand = {
      ...cleanTheme,
      name: "brand",
      tokens: {
        palette: ["#2563eb", "#0891b2", "#16a34a", "#d97706", "#7c3aed"],
        grid: "#e2e8f0",
        axis: "#64748b",
        alarmCritical: "#16a34a",
      },
    };
    const u = await mount(
      buildLineOptions({
        width: 400,
        height: 240,
        categories,
        series: [{ name: "Load", data }],
        theme: brand,
        thresholdBands: [band],
      }),
      1,
    );
    const x = Math.round(u.bbox.left + u.bbox.width / 2);
    const yTop = Math.ceil(u.valToPos(band.max, "y", true)) + 2;
    const yBottom = Math.floor(u.valToPos(band.min, "y", true)) - 2;
    const pixels = u.ctx.getImageData(x, yTop, 1, yBottom - yTop).data;
    let green = 0;
    let red = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      const [r, g, b, a] = [pixels[i]!, pixels[i + 1]!, pixels[i + 2]!, pixels[i + 3]!];
      if (a === 0) continue;
      if (g > r + 20 && g > b) green += 1;
      if (r > g + 60 && r > b + 60) red += 1;
    }
    expect(green).toBeGreaterThan(0);
    expect(red).toBe(0);
  });
});
