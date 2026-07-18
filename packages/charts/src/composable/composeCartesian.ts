import { Children, isValidElement, type ReactNode } from "react";
import type { PlotSeries } from "@axicharts/charts-canvas";
import { resolveSeriesColor } from "@axicharts/charts-canvas";
import type { ChartConfig } from "../container/ChartLayoutContext";
import type { ComposableMarkKind } from "./marks";
import { readMarkKind } from "./readMarkKind";
import { readCartesianCells, resolveCellColor } from "./readCartesianCells";

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

type MarkCellBinding = {
  dataKey: string;
  cells: Map<string, { color?: string; tone?: import("@axicharts/charts-canvas").SeriesTone }>;
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
  const cellBindings: MarkCellBinding[] = [];

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
        if (kind === "bar" || kind === "line" || kind === "area") {
          cellBindings.push({
            dataKey,
            cells: readCartesianCells(child),
          });
        }
        series.push({
          key: dataKey,
          name: String(props.name ?? dataKey),
          data: data.map((row) => Number(row[dataKey])),
          tone: props.tone as PlotSeries["tone"],
        });
        break;
      }
      case "grid":
      case "tooltip":
      case "legend":
      case "cell":
        break;
      default:
        break;
    }
  });

  const categories = data.map((row) => String(row[xKey] ?? ""));

  const withCellFills = series.map((item) => {
    const binding = cellBindings.find((entry) => entry.dataKey === item.key);
    if (!binding || binding.cells.size === 0) return item;

    const baseColor = item.color ?? resolveSeriesColor(item.tone, 0);
    const fills = categories.map((category, index) => {
      const style = binding.cells.get(category);
      return style ? (resolveCellColor(style) ?? baseColor) : baseColor;
    });

    return { ...item, fills };
  });

  return { categories, series: withCellFills, valueSuffix };
}
