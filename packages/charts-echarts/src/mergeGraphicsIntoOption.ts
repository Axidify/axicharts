import type { EChartsOption } from "echarts";
import type { ChartGraphicElement } from "@axicharts/charts-canvas";

export function mergeGraphicsIntoOption(
  option: EChartsOption,
  graphics?: ChartGraphicElement[],
): EChartsOption {
  if (!graphics || graphics.length === 0) {
    return option;
  }

  const existing = option.graphic;
  const existingArr =
    existing == null
      ? []
      : Array.isArray(existing)
        ? existing
        : [existing];

  return {
    ...option,
    graphic: [...existingArr, ...graphics] as EChartsOption["graphic"],
  };
}
