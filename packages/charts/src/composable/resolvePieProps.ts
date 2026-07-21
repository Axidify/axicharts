import { useMemo, type ReactNode } from "react";
import type { PieCenterMetricInput, PieSlice } from "@axicharts/charts-echarts";
import type { ChartConfig } from "../container/ChartLayoutContext";
import { composePieMarks } from "./composePie";

export type PieDataProps = {
  slices?: PieSlice[];
  data?: Record<string, unknown>[];
  children?: ReactNode;
  innerRadius?: number;
  showLabels?: boolean;
  centerMetric?: PieCenterMetricInput;
};

export function useResolvedPieProps(
  props: PieDataProps,
  config: ChartConfig | undefined,
): {
  slices: PieSlice[];
  innerRadius?: number;
  showLabels?: boolean;
  centerMetric?: PieCenterMetricInput;
} {
  const { slices, data, children, innerRadius, showLabels, centerMetric } = props;

  return useMemo(() => {
    if (data && children) {
      const composed = composePieMarks(children, data, config);
      return {
        slices: composed.slices,
        innerRadius: innerRadius ?? composed.innerRadius,
        showLabels: showLabels ?? composed.showLabels,
        centerMetric,
      };
    }

    return {
      slices: slices ?? [],
      innerRadius,
      showLabels,
      centerMetric,
    };
  }, [slices, data, children, config, innerRadius, showLabels, centerMetric]);
}
