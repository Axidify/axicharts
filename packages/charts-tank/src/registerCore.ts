import type { ComponentType } from "react";
import { registerChartType } from "@axicharts/charts/registry";
import { TankChart } from "./TankChart";

let registered = false;

export function registerTankChart(): void {
  if (registered) return;

  registerChartType({
    type: "tank",
    Chart: TankChart as ComponentType<Record<string, unknown>>,
    defaultRenderer: "svg",
  });

  registered = true;
}
