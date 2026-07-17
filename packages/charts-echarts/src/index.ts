import {
  BarChart,
  CandlestickChart,
  HeatmapChart,
  LineChart,
  PieChart,
} from "echarts/charts";
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
  VisualMapComponent,
} from "echarts/components";
import * as echarts from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";

echarts.use([
  BarChart,
  CandlestickChart,
  HeatmapChart,
  LineChart,
  PieChart,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  VisualMapComponent,
  CanvasRenderer,
]);

export { EChartsCandlestick, type EChartsCandlestickProps } from "./EChartsCandlestick";
export { EChartsHeatmap, type EChartsHeatmapProps } from "./EChartsHeatmap";
export { EChartsPie, type EChartsPieProps } from "./EChartsPie";
export { EChartsWaterfall, type EChartsWaterfallProps } from "./EChartsWaterfall";
export {
  useEChart,
  type EChartCursorEvent,
  type EChartItemHoverEvent,
} from "./useEChart";
export {
  SERIES_COLORS,
  SERIES_PALETTE,
  type HeatmapMatrix,
  type OhlcPoint,
  type PieSlice,
  type SeriesTone,
  type WaterfallItem,
} from "./types";
