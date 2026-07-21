import { describe, expect, it } from "vitest";
import {
  resolveScatterAxisLayout,
  scatterLabelDensity,
  scatterLabelFontSize,
} from "./scatterLabels";

describe("scatterLabels", () => {
  it("classifies label density by point count", () => {
    expect(scatterLabelDensity(6)).toBe("sparse");
    expect(scatterLabelDensity(12)).toBe("dense");
    expect(scatterLabelDensity(30)).toBe("crowded");
  });

  it("places the legend at the bottom on compact dashboard tiles", () => {
    const layout = resolveScatterAxisLayout(360, 280, {
      pointCount: 10,
      showLegend: true,
      xLabel: "Risk",
      yLabel: "Return",
    });

    expect(layout.compact).toBe(true);
    expect(layout.legendBottom).toBe(true);
    expect(layout.gridTop).toBe(12);
    expect(layout.gridBottom).toBe(34);
  });

  it("shrinks axis name gaps and fonts in compact panels", () => {
    const layout = resolveScatterAxisLayout(240, 140, {
      pointCount: 10,
      xLabel: "Risk",
      yLabel: "Return",
      showPointLabels: true,
    });

    expect(layout.compact).toBe(true);
    expect(layout.nameFontSize).toBe(9);
    expect(layout.xNameGap).toBe(20);
    expect(layout.yNameGap).toBe(32);
    expect(layout.gridBottom).toBe(30);
    expect(layout.gridLeft).toBe(40);
    expect(layout.hideOverlap).toBe(true);
  });

  it("uses larger typography in full-size panels", () => {
    const layout = resolveScatterAxisLayout(520, 320, {
      pointCount: 6,
      xLabel: "Risk",
      yLabel: "Return",
    });

    expect(layout.compact).toBe(false);
    expect(layout.nameFontSize).toBe(11);
    expect(layout.hideOverlap).toBe(false);
    expect(scatterLabelFontSize(layout.labelDensity, layout.compact)).toBe(10);
  });
});
