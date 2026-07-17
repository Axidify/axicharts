import { Children, isValidElement, type ReactNode } from "react";
import type { FunnelStage } from "@axicharts/charts-echarts";
import type { SeriesTone } from "@axicharts/charts-canvas";
import type { ChartConfig } from "../container/ChartLayoutContext";
import { readMarkKind } from "./readMarkKind";

export type ComposedFunnel = {
  stages: FunnelStage[];
  sort?: "ascending" | "descending" | "none";
};

export function composeFunnelMarks(
  children: ReactNode,
  data: Record<string, unknown>[],
  config: ChartConfig | undefined,
): ComposedFunnel {
  let nameKey = "name";
  let valueKey = "value";
  let sort: ComposedFunnel["sort"];

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    if (readMarkKind(child.type) !== "funnel") return;

    const props = child.props as {
      dataKey?: string;
      nameKey?: string;
      sort?: ComposedFunnel["sort"];
    };

    nameKey = String(props.nameKey ?? nameKey);
    valueKey = String(props.dataKey ?? valueKey);
    sort = props.sort;
  });

  const stages: FunnelStage[] = data.map((row) => {
    const rawName = String(row[nameKey] ?? "");
    const value = Number(row[valueKey] ?? 0);
    const tone = row.tone as SeriesTone | undefined;

    return {
      key: rawName,
      name: rawName,
      value,
      tone,
    };
  });

  return { stages, sort };
}
