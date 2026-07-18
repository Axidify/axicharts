import { Children, isValidElement, type ReactNode } from "react";
import type { PieSlice } from "@axicharts/charts-echarts";
import type { SeriesTone } from "@axicharts/charts-canvas";
import { SERIES_COLORS } from "@axicharts/charts-canvas";
import type { ChartConfig } from "../container/ChartLayoutContext";
import { readMarkKind } from "./readMarkKind";

export type ComposedPie = {
  slices: PieSlice[];
  innerRadius?: number;
  showLabels?: boolean;
};

function readCellStyles(pieChild: ReactNode): Map<string, { tone?: SeriesTone; color?: string }> {
  const styles = new Map<string, { tone?: SeriesTone; color?: string }>();

  if (!isValidElement(pieChild)) return styles;

  const pieProps = pieChild.props as { children?: ReactNode };
  Children.forEach(pieProps.children, (cell) => {
    if (!isValidElement(cell) || readMarkKind(cell.type) !== "cell") return;
    const props = cell.props as {
      dataKey?: string;
      tone?: SeriesTone;
      color?: string;
      fill?: string;
    };
    const key = props.dataKey;
    if (!key) return;
    styles.set(key, {
      tone: props.tone,
      color: props.color ?? props.fill,
    });
  });

  return styles;
}

export function composePieMarks(
  children: ReactNode,
  data: Record<string, unknown>[],
  config: ChartConfig | undefined,
): ComposedPie {
  let nameKey = "name";
  let valueKey = "value";
  let innerRadius: number | undefined;
  let showLabels: boolean | undefined;
  let cellStyles = new Map<string, { tone?: SeriesTone; color?: string }>();

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    if (readMarkKind(child.type) !== "pie") return;

    const props = child.props as {
      dataKey?: string;
      nameKey?: string;
      innerRadius?: number;
      showLabels?: boolean;
      children?: ReactNode;
    };

    nameKey = String(props.nameKey ?? nameKey);
    valueKey = String(props.dataKey ?? valueKey);
    innerRadius = props.innerRadius;
    showLabels = props.showLabels;
    cellStyles = readCellStyles(child);
  });

  const slices: PieSlice[] = data.map((row) => {
    const rawName = String(row[nameKey] ?? "");
    const value = Number(row[valueKey] ?? 0);
    const style = cellStyles.get(rawName);
    const tone = style?.tone;
    const color =
      style?.color ?? (tone ? SERIES_COLORS[tone] : undefined);

    return {
      key: rawName,
      name: rawName,
      value,
      tone,
      color,
    };
  });

  return { slices, innerRadius, showLabels };
}
