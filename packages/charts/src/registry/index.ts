import type { ChartTypeRegistration } from "./types";
import { BarChart } from "../bar/BarChart";
import { LineChart } from "../line/LineChart";
import { registerChartType } from "./registry";

let builtinsRegistered = false;

export function registerBuiltinChartTypes(): void {
  if (builtinsRegistered) return;

  registerChartType({
    type: "line",
    Chart: LineChart as ChartTypeRegistration["Chart"],
    defaultRenderer: "canvas",
  });
  registerChartType({
    type: "bar",
    Chart: BarChart as ChartTypeRegistration["Chart"],
    defaultRenderer: "canvas",
  });

  builtinsRegistered = true;
}

export {
  clearChartTypes,
  getChartType,
  listChartTypes,
  registerChartType,
} from "./registry";
export type { ChartRenderer, ChartTypeRegistration } from "./types";
