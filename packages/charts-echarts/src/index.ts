import {
  BarChart,
  CandlestickChart,
  HeatmapChart,
  LineChart,
  PieChart,
  ScatterChart,
  TreemapChart,
} from "echarts/charts";
import {
  GridComponent,
  DataZoomComponent,
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
  ScatterChart,
  TreemapChart,
  GridComponent,
  DataZoomComponent,
  LegendComponent,
  TooltipComponent,
  VisualMapComponent,
  CanvasRenderer,
]);

export { buildDataZoom, type BuildDataZoomInput } from "./dataZoom";
export { EChartsCandlestick, type EChartsCandlestickProps } from "./EChartsCandlestick";
export { EChartsTreemap, type EChartsTreemapProps } from "./EChartsTreemap";
export { EChartsScatter, type EChartsScatterProps } from "./EChartsScatter";
export { EChartsHeatmap, type EChartsHeatmapProps } from "./EChartsHeatmap";
export { EChartsPie, type EChartsPieProps } from "./EChartsPie";
export { EChartsWaterfall, type EChartsWaterfallProps } from "./EChartsWaterfall";
export type { TreemapNode } from "./treemapTypes";
export type { ScatterPoint, ScatterSeries } from "./scatterTypes";
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
