import { categoryToIndex } from "@axicharts/charts-canvas";
import { categoryIndexToRatio, clampMarkerY } from "../annotations/dragMarker";
import type { CartesianPlotInsets } from "../annotations/cartesianPlotInsets";
import { plotInnerSize } from "../annotations/cartesianPlotInsets";

export type GraphicPlotContext = {
  width: number;
  height: number;
  insets: CartesianPlotInsets;
  categories: string[];
  yMin: number;
  yMax: number;
};

export function resolveGraphicCoord(
  value: number | string | undefined,
  axis: "x" | "y",
  ctx: GraphicPlotContext,
): number | undefined {
  if (value == null) return undefined;

  const { width, height, insets, categories, yMin, yMax } = ctx;
  const { width: plotWidth, height: plotHeight } = plotInnerSize(
    width,
    height,
    insets,
  );

  if (typeof value === "number") {
    return axis === "x" ? insets.left + value : insets.top + value;
  }

  const str = value.trim();

  if (str.startsWith("plot:")) {
    const ratio = Number(str.slice(5));
    if (!Number.isFinite(ratio)) return undefined;
    if (axis === "x") return insets.left + ratio * plotWidth;
    return insets.top + ratio * plotHeight;
  }

  if (str.startsWith("category:")) {
    if (axis !== "x") return undefined;
    const raw = str.slice(9);
    const idx =
      categoryToIndex(raw, categories) ??
      categoryToIndex(Number(raw), categories);
    if (idx == null) return undefined;
    const ratio = categoryIndexToRatio(idx, categories.length);
    return insets.left + ratio * plotWidth;
  }

  if (str.startsWith("value:")) {
    if (axis !== "y") return undefined;
    const val = Number(str.slice(6));
    if (!Number.isFinite(val)) return undefined;
    const yRatio =
      (clampMarkerY(val, yMin, yMax) - yMin) / (yMax - yMin || 1);
    return insets.top + (1 - yRatio) * plotHeight;
  }

  if (str.endsWith("%")) {
    const pct = Number(str.slice(0, -1));
    if (!Number.isFinite(pct)) return undefined;
    const ratio = pct / 100;
    if (axis === "x") return insets.left + ratio * plotWidth;
    return insets.top + ratio * plotHeight;
  }

  const num = Number(str);
  if (Number.isFinite(num)) {
    return axis === "x" ? insets.left + num : insets.top + num;
  }

  return undefined;
}
