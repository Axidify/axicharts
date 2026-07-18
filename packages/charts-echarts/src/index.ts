import {
  BarChart,
  BoxplotChart,
  CandlestickChart,
  FunnelChart,
  HeatmapChart,
  LineChart,
  PieChart,
  RadarChart,
  ScatterChart,
  SunburstChart,
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
  BoxplotChart,
  CandlestickChart,
  FunnelChart,
  HeatmapChart,
  LineChart,
  PieChart,
  RadarChart,
  ScatterChart,
  SunburstChart,
  TreemapChart,
  GridComponent,
  DataZoomComponent,
  LegendComponent,
  TooltipComponent,
  VisualMapComponent,
  CanvasRenderer,
]);

export { buildDataZoom, type BuildDataZoomInput } from "./dataZoom";
export { buildWaterfallBridge, type WaterfallBridge, type WaterfallConnector } from "./waterfallBridge";
export { EChartsCandlestick, type EChartsCandlestickProps } from "./EChartsCandlestick";
export { EChartsFunnel, type EChartsFunnelProps } from "./EChartsFunnel";
export { EChartsSunburst, type EChartsSunburstProps } from "./EChartsSunburst";
export { EChartsTreemap, type EChartsTreemapProps } from "./EChartsTreemap";
export type { HierarchyNode } from "./hierarchyTypes";
export type { FunnelStage } from "./funnelTypes";
export {
  buildTreemapDrillOptions,
  treePathToDrillPath,
  type TreemapDrillChange,
} from "./treemapDrill";
export { EChartsBoxplot, type EChartsBoxplotProps } from "./EChartsBoxplot";
export { EChartsHistogram, type EChartsHistogramProps } from "./EChartsHistogram";
export type { BoxplotItem, BoxplotSeries } from "./boxplotTypes";
export { EChartsScatter, type EChartsScatterProps } from "./EChartsScatter";
export {
  EChartsHeatmap,
  sliceHeatmapByBrushRange,
  type EChartsHeatmapProps,
  type HeatmapBrushRange,
} from "./EChartsHeatmap";
export { EChartsRadar, type EChartsRadarProps } from "./EChartsRadar";
export type { RadarIndicator, RadarSeries } from "./radarTypes";
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
