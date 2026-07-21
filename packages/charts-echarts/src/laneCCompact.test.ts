import { describe, expect, it } from "vitest";
import {
  INDUSTRIAL_TILE_H,
  NICHE_CATALOG_H,
  NICHE_CATALOG_W,
  resolveCandlestickNicheLayout,
  resolveDistributionNicheLayout,
  resolveLiquidFillLayout,
  resolveTreemapLayout,
} from "./nicheCompactLayout";

describe("Lane C compact layouts", () => {
  it("tightens distribution charts @ catalog card size", () => {
    const layout = resolveDistributionNicheLayout(NICHE_CATALOG_W, NICHE_CATALOG_H, 1);
    expect(layout.catalog).toBe(true);
    expect(layout.axisFontSize).toBe(9);
    expect(layout.hideYAxisLabels).toBe(true);
  });

  it("hides treemap labels @ catalog size", () => {
    const layout = resolveTreemapLayout(NICHE_CATALOG_W, NICHE_CATALOG_H, true);
    expect(layout.showLabels).toBe(false);
    expect(layout.upperLabelHeight).toBe(14);
  });

  it("shrinks liquid fill label @ industrial tile", () => {
    const layout = resolveLiquidFillLayout(180, INDUSTRIAL_TILE_H);
    expect(layout.labelFontSize).toBe(14);
    expect(layout.radius).toBe("80%");
  });

  it("hides candlestick category labels @ catalog size", () => {
    const layout = resolveCandlestickNicheLayout(NICHE_CATALOG_W, NICHE_CATALOG_H);
    expect(layout.hideCategoryLabels).toBe(true);
    expect(layout.axisFontSize).toBe(9);
  });
});
