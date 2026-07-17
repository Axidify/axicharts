import type { ComponentType } from "react";
import { registerChartType } from "@axicharts/charts/registry";
import { GeoMapChart } from "./GeoMapChart";

let registered = false;

export function registerGeoChart(): void {
  if (registered) return;

  registerChartType({
    type: "geo",
    Chart: GeoMapChart as ComponentType<Record<string, unknown>>,
    defaultRenderer: "svg",
  });

  registered = true;
}
