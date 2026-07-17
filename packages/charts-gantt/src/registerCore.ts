import type { ComponentType } from "react";
import { registerChartType } from "@axicharts/charts/registry";
import { GanttChart } from "./GanttChart";

let registered = false;

export function registerGanttChart(): void {
  if (registered) return;

  registerChartType({
    type: "gantt",
    Chart: GanttChart as ComponentType<Record<string, unknown>>,
    defaultRenderer: "svg",
  });

  registered = true;
}
