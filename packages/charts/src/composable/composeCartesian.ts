import { Children, isValidElement, type ReactNode } from "react";
import type { PlotSeries } from "@axicharts/charts-canvas";
import { resolveSeriesColor } from "@axicharts/charts-canvas";
import type { ChartConfig } from "../container/ChartLayoutContext";
import type { ComposableMarkKind } from "./marks";
import { readMarkKind } from "./readMarkKind";
import { readCartesianCells, resolveCellColor, type CartesianCellStyle } from "./readCartesianCells";

export type ComposedCartesian = {
  categories: string[];
  series: PlotSeries[];
  valueSuffix?: string;
  curve?: import("@axicharts/charts-theme").LineCurve;
};

const Y_AXIS_SUFFIX: Partial<Record<string, string>> = {
  currency: " USD",
  percent: "%",
  bps: " bps",
};

type MarkCellBinding = {
  dataKey: string;
  markKind: "bar" | "line" | "area";
  cells: Map<string, CartesianCellStyle>;
};

export function composeCartesianMarks(
  children: ReactNode,
  data: Record<string, unknown>[],
  config: ChartConfig | undefined,
  seriesKinds: ComposableMarkKind[],
): ComposedCartesian {
  let xKey = "date";
  let valueSuffix: string | undefined;
  let curve: ComposedCartesian["curve"];
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
        if (kind === "line" || kind === "area") {
          const markType = props.type;
          if (markType === "linear" || markType === "monotone") {
            curve = markType;
          }
        }
        if (kind === "bar" || kind === "line" || kind === "area") {
          cellBindings.push({
            dataKey,
            markKind: kind,
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

  const withCellStyles = series.map((item) => {
    const binding = cellBindings.find((entry) => entry.dataKey === item.key);
    if (!binding || binding.cells.size === 0) return item;

    const baseColor = item.color ?? resolveSeriesColor(item.tone, 0);
    const fills = categories.map((category) => {
      const style = binding.cells.get(category);
      return style ? (resolveCellColor(style) ?? baseColor) : baseColor;
    });
    const rawSizes = categories.map(
      (category) => binding.cells.get(category)?.size,
    );
    const hasSizes = rawSizes.some((value) => value != null);
    const defaultSize = binding.markKind === "bar" ? 1 : 4;

    return {
      ...item,
      fills,
      ...(hasSizes
        ? { sizes: rawSizes.map((value) => value ?? defaultSize) }
        : {}),
    };
  });

  return { categories, series: withCellStyles, valueSuffix, curve };
}
