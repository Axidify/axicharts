import type { ComponentType } from "react";
import { registerChartType } from "@axicharts/charts/registry";
import { MapChart } from "./MapChart";

let registered = false;

export function registerMapChart(): void {
  if (registered) return;

  registerChartType({
    type: "map",
    Chart: MapChart as ComponentType<Record<string, unknown>>,
    defaultRenderer: "svg",
  });

  registered = true;
}
