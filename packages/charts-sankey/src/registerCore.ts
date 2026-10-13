import type { ComponentType } from "react";
import { registerChartType } from "@axicharts/charts/registry";
import { SankeyChart } from "./SankeyChart";

let registered = false;

export function registerSankeyChart(): void {
  if (registered) return;

  registerChartType({
    type: "sankey",
    Chart: SankeyChart as ComponentType<Record<string, unknown>>,
    defaultRenderer: "canvas",
    fromSpec: ({ props, data }) => ({
      nodes: props.nodes ?? data.nodes ?? [],
      links: props.links ?? data.links ?? [],
      surface: props.surface,
    }),
  });

  registered = true;
}
