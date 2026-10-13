import { useMemo, type ReactNode } from "react";
import type { ValueFormat } from "@axicharts/charts-core";
import type { LineCurve } from "@axicharts/charts-theme";
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
  valueFormat?: ValueFormat;
  curve?: LineCurve;
};

export function useResolvedCartesianProps(
  props: CartesianDataProps,
  config: ChartConfig | undefined,
  seriesKinds: ComposableMarkKind[],
): {
  categories: string[];
  series: PlotSeries[];
  valueSuffix?: string;
  valueFormat?: ValueFormat;
  curve?: LineCurve;
} {
  const { categories, series, data, children, valueSuffix, valueFormat, curve } = props;

  return useMemo(() => {
    if (data && children) {
      const composed = composeCartesianMarks(children, data, config, seriesKinds);
      return {
        categories: composed.categories,
        series: composed.series,
        valueSuffix,
        valueFormat: valueFormat ?? composed.valueFormat,
        curve: curve ?? composed.curve,
      };
    }

    return {
      categories: categories ?? [],
      series: series ?? [],
      valueSuffix,
      valueFormat,
      curve,
    };
  }, [
    categories,
    series,
    data,
    children,
    config,
    seriesKinds,
    valueSuffix,
    valueFormat,
    curve,
  ]);
}
