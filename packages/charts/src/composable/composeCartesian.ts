import { Children, isValidElement, type ReactNode } from "react";
import type { PlotSeries } from "@axicharts/charts-canvas";
import type { ChartConfig } from "../container/ChartLayoutContext";
import type { ComposableMarkKind } from "./marks";
import { readMarkKind } from "./readMarkKind";

export type ComposedCartesian = {
  categories: string[];
  series: PlotSeries[];
  valueSuffix?: string;
};

const Y_AXIS_SUFFIX: Partial<Record<string, string>> = {
  currency: " USD",
  percent: "%",
  bps: " bps",
};

export function composeCartesianMarks(
  children: ReactNode,
  data: Record<string, unknown>[],
  config: ChartConfig | undefined,
  seriesKinds: ComposableMarkKind[],
): ComposedCartesian {
  let xKey = "date";
  let valueSuffix: string | undefined;
  const series: PlotSeries[] = [];

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;

    const kind = readMarkKind(child.type);
    if (!kind) return;

    const props = child.props as Record<string, unknown>;

    switch (kind) {
      case "xAxis":
        xKey = String(props.dataKey ?? xKey);
        break;
      case "yAxis": {
        const tickFormat = props.tickFormat;
        if (typeof tickFormat === "string") {
          valueSuffix = Y_AXIS_SUFFIX[tickFormat];
        }
        break;
      }
      case "line":
      case "area":
      case "bar": {
        if (!seriesKinds.includes(kind)) break;
        const dataKey = String(props.dataKey);
        series.push({
          name: String(config?.[dataKey]?.label ?? props.name ?? dataKey),
          data: data.map((row) => Number(row[dataKey])),
          tone: props.tone as PlotSeries["tone"],
        });
        break;
      }
      case "grid":
      case "tooltip":
      case "legend":
        break;
      default:
        break;
    }
  });

  const categories = data.map((row) => String(row[xKey] ?? ""));

  return { categories, series, valueSuffix };
}
