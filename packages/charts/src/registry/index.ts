import type { ChartTypeRegistration } from "./types";
import { AreaChart } from "../area/AreaChart";
import { BarChart } from "../bar/BarChart";
import { CandlestickChart } from "../candlestick/CandlestickChart";
import { BoxplotChart } from "../boxplot/BoxplotChart";
import { FunnelChart } from "../funnel/FunnelChart";
import { PictorialBarChart } from "../pictorialBar/PictorialBarChart";
import { LiquidFillChart } from "../liquidFill/LiquidFillChart";
import { HeatmapChart } from "../heatmap/HeatmapChart";
import { CalendarHeatmapChart } from "../calendar/CalendarHeatmapChart";
import { HistogramChart } from "../histogram/HistogramChart";
import { LineChart } from "../line/LineChart";
import { PieChart } from "../pie/PieChart";
import { RadarChart } from "../radar/RadarChart";
import { ParallelChart } from "../parallel/ParallelChart";
import { ThemeRiverChart } from "../themeRiver/ThemeRiverChart";
import { BumpChart } from "../bump/BumpChart";
import { WordCloudChart } from "../wordCloud/WordCloudChart";
import { ScatterChart } from "../scatter/ScatterChart";
import { TreemapChart } from "../treemap/TreemapChart";
import { SunburstChart } from "../sunburst/SunburstChart";
import { WaterfallChart } from "../waterfall/WaterfallChart";
import { registerChartType } from "./registry";

let builtinsRegistered = false;

const builtins: ChartTypeRegistration[] = [
  { type: "line", Chart: LineChart as ChartTypeRegistration["Chart"], defaultRenderer: "canvas" },
  { type: "bar", Chart: BarChart as ChartTypeRegistration["Chart"], defaultRenderer: "canvas" },
  { type: "area", Chart: AreaChart as ChartTypeRegistration["Chart"], defaultRenderer: "canvas" },
  { type: "pie", Chart: PieChart as ChartTypeRegistration["Chart"], defaultRenderer: "canvas" },
  {
    type: "funnel",
    Chart: FunnelChart as ChartTypeRegistration["Chart"],
    defaultRenderer: "canvas",
  },
  {
    type: "pictorial-bar",
    Chart: PictorialBarChart as ChartTypeRegistration["Chart"],
    defaultRenderer: "canvas",
  },
  {
    type: "liquid-fill",
    Chart: LiquidFillChart as ChartTypeRegistration["Chart"],
    defaultRenderer: "canvas",
  },
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
    type: "sunburst",
    Chart: SunburstChart as ChartTypeRegistration["Chart"],
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
  {
    type: "calendar",
    Chart: CalendarHeatmapChart as ChartTypeRegistration["Chart"],
    defaultRenderer: "canvas",
  },
  {
    type: "radar",
    Chart: RadarChart as ChartTypeRegistration["Chart"],
    defaultRenderer: "canvas",
  },
  {
    type: "parallel",
    Chart: ParallelChart as ChartTypeRegistration["Chart"],
    defaultRenderer: "canvas",
  },
  {
    type: "theme-river",
    Chart: ThemeRiverChart as ChartTypeRegistration["Chart"],
    defaultRenderer: "canvas",
  },
  {
    type: "bump",
    Chart: BumpChart as ChartTypeRegistration["Chart"],
    defaultRenderer: "canvas",
  },
  {
    type: "word-cloud",
    Chart: WordCloudChart as ChartTypeRegistration["Chart"],
    defaultRenderer: "canvas",
  },
  {
    type: "boxplot",
    Chart: BoxplotChart as ChartTypeRegistration["Chart"],
    defaultRenderer: "canvas",
  },
  {
    type: "histogram",
    Chart: HistogramChart as ChartTypeRegistration["Chart"],
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
