import type { ComponentType } from "react";
import { registerChartType } from "../registry/registry";
import { EChartsOptionChart } from "./EChartsOptionChart";

let registered = false;

export function registerEChartsOptionChart(): void {
  if (registered) return;

  registerChartType({
    type: "echarts",
    Chart: EChartsOptionChart as ComponentType<Record<string, unknown>>,
    defaultRenderer: "canvas",
  });

  registered = true;
}
