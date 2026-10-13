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
    fromSpec: ({ props, data }) => ({
      tasks: props.tasks ?? data.tasks ?? [],
      milestones: props.milestones ?? data.milestones,
      unit: props.unit,
      rangeStart: props.rangeStart,
      rangeEnd: props.rangeEnd,
      today: props.today,
      surface: props.surface,
    }),
  });

  registered = true;
}
