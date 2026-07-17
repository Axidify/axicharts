import { useMemo, type ReactNode } from "react";
import type { FunnelStage } from "@axicharts/charts-echarts";
import type { ChartConfig } from "../container/ChartLayoutContext";
import { composeFunnelMarks } from "./composeFunnel";

export type FunnelDataProps = {
  stages?: FunnelStage[];
  data?: Record<string, unknown>[];
  children?: ReactNode;
  sort?: "ascending" | "descending" | "none";
};

export function useResolvedFunnelProps(
  props: FunnelDataProps,
  config: ChartConfig | undefined,
): {
  stages: FunnelStage[];
  sort?: "ascending" | "descending" | "none";
} {
  const { stages, data, children, sort } = props;

  return useMemo(() => {
    if (data && children) {
      const composed = composeFunnelMarks(children, data, config);
      return {
        stages: composed.stages,
        sort: sort ?? composed.sort,
      };
    }

    return {
      stages: stages ?? [],
      sort,
    };
  }, [stages, data, children, config, sort]);
}
