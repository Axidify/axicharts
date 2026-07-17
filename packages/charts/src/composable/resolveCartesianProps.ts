import { useMemo, type ReactNode } from "react";
import type { PlotSeries } from "@axicharts/charts-canvas";
import type { ChartConfig } from "../container/ChartLayoutContext";
import { composeCartesianMarks } from "./composeCartesian";
import type { ComposableMarkKind } from "./marks";

export type CartesianDataProps = {
  categories?: string[];
  series?: PlotSeries[];
  data?: Record<string, unknown>[];
  children?: ReactNode;
  valueSuffix?: string;
};

export function useResolvedCartesianProps(
  props: CartesianDataProps,
  config: ChartConfig | undefined,
  seriesKinds: ComposableMarkKind[],
): {
  categories: string[];
  series: PlotSeries[];
  valueSuffix?: string;
} {
  const { categories, series, data, children, valueSuffix } = props;

  return useMemo(() => {
    if (data && children) {
      const composed = composeCartesianMarks(children, data, config, seriesKinds);
      return {
        categories: composed.categories,
        series: composed.series,
        valueSuffix: valueSuffix ?? composed.valueSuffix,
      };
    }

    return {
      categories: categories ?? [],
      series: series ?? [],
      valueSuffix,
    };
  }, [
    categories,
    series,
    data,
    children,
    config,
    seriesKinds,
    valueSuffix,
  ]);
}
