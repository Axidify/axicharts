import { Children, isValidElement, type ReactNode } from "react";
import type { PieSlice } from "@axicharts/charts-echarts";
import type { SeriesTone } from "@axicharts/charts-canvas";
import type { ChartConfig } from "../container/ChartLayoutContext";
import { readMarkKind } from "./readMarkKind";

export type ComposedPie = {
  slices: PieSlice[];
  innerRadius?: number;
  showLabels?: boolean;
};

function readCellTones(pieChild: ReactNode): Map<string, SeriesTone> {
  const tones = new Map<string, SeriesTone>();

  if (!isValidElement(pieChild)) return tones;

  const pieProps = pieChild.props as { children?: ReactNode };
  Children.forEach(pieProps.children, (cell) => {
    if (!isValidElement(cell) || readMarkKind(cell.type) !== "cell") return;
    const props = cell.props as { dataKey?: string; tone?: SeriesTone };
    const key = props.dataKey;
    if (key && props.tone) {
      tones.set(key, props.tone);
    }
  });

  return tones;
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
  let cellTones = new Map<string, SeriesTone>();

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
    cellTones = readCellTones(child);
  });

  const slices: PieSlice[] = data.map((row) => {
    const rawName = String(row[nameKey] ?? "");
    const value = Number(row[valueKey] ?? 0);
    const tone = cellTones.get(rawName);

    return {
      key: rawName,
      name: rawName,
      value,
      tone,
    };
  });

  return { slices, innerRadius, showLabels };
}
