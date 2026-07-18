import type { HeatmapMatrix } from "@axicharts/charts-echarts";
import { sliceHeatmapByBrushRange } from "@axicharts/charts-echarts";
import type { BrushRange } from "./brushRange";

export { sliceHeatmapByBrushRange };

export function sliceHeatmapMatrixByBrushRange(
  matrix: HeatmapMatrix,
  range: BrushRange | null,
): HeatmapMatrix {
  return sliceHeatmapByBrushRange(matrix, range);
}
