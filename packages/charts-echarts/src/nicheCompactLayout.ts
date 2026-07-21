import { isCompactTile } from "./themeBridge";

/** Catalog / mosaic card size for analytics niche charts. */
export const NICHE_CATALOG_W = 280;
export const NICHE_CATALOG_H = 140;

/** Industrial HMI tile — gauge, digital, liquid fill. */
export const INDUSTRIAL_TILE_W = 180;
export const INDUSTRIAL_TILE_H = 120;

export function isNicheCatalogTile(width: number, height: number): boolean {
  return width <= 320 && height <= 160;
}

export function isIndustrialTile(height: number): boolean {
  return height <= 130;
}

function nicheAxisFontSize(compact: boolean, catalog: boolean): number {
  if (catalog) return 9;
  if (compact) return 10;
  return 11;
}

export function resolveDistributionNicheLayout(
  width: number,
  height: number,
  seriesCount: number,
) {
  const compact = isCompactTile(width, height);
  const catalog = isNicheCatalogTile(width, height);
  return {
    compact,
    catalog,
    axisFontSize: nicheAxisFontSize(compact, catalog),
    gridTop: seriesCount > 1 ? (catalog ? 20 : 28) : undefined,
    hideYAxisLabels: catalog && height <= 140,
  };
}

export function resolveTreemapLayout(
  width: number,
  height: number,
  showLabels: boolean,
) {
  const catalog = isNicheCatalogTile(width, height);
  const compact = isCompactTile(width, height);
  return {
    compact,
    catalog,
    showLabels: showLabels && !catalog,
    labelFontSize: catalog ? 9 : 11,
    upperLabelHeight: catalog ? 14 : 22,
  };
}

export function resolveLiquidFillLayout(width: number, height: number) {
  const industrial = isIndustrialTile(height);
  const catalog = isNicheCatalogTile(width, height);
  return {
    compact: industrial || catalog,
    radius: industrial ? "80%" : catalog ? "84%" : "88%",
    labelFontSize: industrial ? 14 : catalog ? 18 : 28,
    borderWidth: industrial ? 1 : 2,
  };
}

export function resolveCandlestickNicheLayout(width: number, height: number) {
  const catalog = isNicheCatalogTile(width, height);
  const compact = isCompactTile(width, height);
  return {
    compact,
    catalog,
    axisFontSize: catalog ? 9 : 11,
    hideCategoryLabels: catalog,
  };
}
