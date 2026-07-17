import type { ChartTypeRegistration } from "./types";
import { AreaChart } from "../area/AreaChart";
import { BarChart } from "../bar/BarChart";
import { CandlestickChart } from "../candlestick/CandlestickChart";
import { HeatmapChart } from "../heatmap/HeatmapChart";
import { LineChart } from "../line/LineChart";
import { PieChart } from "../pie/PieChart";
import { ScatterChart } from "../scatter/ScatterChart";
import { TreemapChart } from "../treemap/TreemapChart";
import { WaterfallChart } from "../waterfall/WaterfallChart";
import { registerChartType } from "./registry";

let builtinsRegistered = false;

const builtins: ChartTypeRegistration[] = [
  { type: "line", Chart: LineChart as ChartTypeRegistration["Chart"], defaultRenderer: "canvas" },
  { type: "bar", Chart: BarChart as ChartTypeRegistration["Chart"], defaultRenderer: "canvas" },
  { type: "area", Chart: AreaChart as ChartTypeRegistration["Chart"], defaultRenderer: "canvas" },
  { type: "pie", Chart: PieChart as ChartTypeRegistration["Chart"], defaultRenderer: "canvas" },
  {
    type: "scatter",
    Chart: ScatterChart as ChartTypeRegistration["Chart"],
    defaultRenderer: "canvas",
  },
  {
    type: "treemap",
    Chart: TreemapChart as ChartTypeRegistration["Chart"],
    defaultRenderer: "canvas",
  },
  {
    type: "candlestick",
    Chart: CandlestickChart as ChartTypeRegistration["Chart"],
    defaultRenderer: "canvas",
  },
  {
    type: "waterfall",
    Chart: WaterfallChart as ChartTypeRegistration["Chart"],
    defaultRenderer: "canvas",
  },
  {
    type: "heatmap",
    Chart: HeatmapChart as ChartTypeRegistration["Chart"],
    defaultRenderer: "canvas",
  },
];

export function registerBuiltinChartTypes(): void {
  if (builtinsRegistered) return;

  for (const entry of builtins) {
    registerChartType(entry);
  }

  builtinsRegistered = true;
}

export {
  clearChartTypes,
  getChartType,
  listChartTypes,
  registerChartType,
} from "./registry";
export type { ChartRenderer, ChartTypeRegistration } from "./types";
