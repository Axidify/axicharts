import type { ComponentType } from "react";
import { registerChartType } from "@axicharts/charts/registry";
import { AndonBoard } from "./AndonBoard";

let registered = false;

export function registerAndonChart(): void {
  if (registered) return;

  registerChartType({
    type: "andon",
    Chart: AndonBoard as ComponentType<Record<string, unknown>>,
    defaultRenderer: "svg",
  });

  registered = true;
}
