import { useMemo, type ReactNode } from "react";
import type { PieSlice } from "@axicharts/charts-echarts";
import type { ChartConfig } from "../container/ChartLayoutContext";
import { composePieMarks } from "./composePie";

export type PieDataProps = {
  slices?: PieSlice[];
  data?: Record<string, unknown>[];
  children?: ReactNode;
  innerRadius?: number;
  showLabels?: boolean;
};

export function useResolvedPieProps(
  props: PieDataProps,
  config: ChartConfig | undefined,
): {
  slices: PieSlice[];
  innerRadius?: number;
  showLabels?: boolean;
} {
  const { slices, data, children, innerRadius, showLabels } = props;

  return useMemo(() => {
    if (data && children) {
      const composed = composePieMarks(children, data, config);
      return {
        slices: composed.slices,
        innerRadius: innerRadius ?? composed.innerRadius,
        showLabels: showLabels ?? composed.showLabels,
      };
    }

    return {
      slices: slices ?? [],
      innerRadius,
      showLabels,
    };
  }, [slices, data, children, config, innerRadius, showLabels]);
}
