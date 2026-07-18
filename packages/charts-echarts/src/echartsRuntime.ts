import {
  BarChart,
  BoxplotChart,
  CandlestickChart,
  FunnelChart,
  HeatmapChart,
  LineChart,
  ParallelChart,
  PieChart,
  RadarChart,
  ScatterChart,
  SunburstChart,
  ThemeRiverChart,
  TreemapChart,
} from "echarts/charts";
import {
  DataZoomComponent,
  DatasetComponent,
  GridComponent,
  LegendComponent,
  ParallelComponent,
  SingleAxisComponent,
  TooltipComponent,
  VisualMapComponent,
} from "echarts/components";
import * as echarts from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";

echarts.use([
  BarChart,
  BoxplotChart,
  CandlestickChart,
  DatasetComponent,
  FunnelChart,
  HeatmapChart,
  LineChart,
  ParallelChart,
  PieChart,
  RadarChart,
  ScatterChart,
  SunburstChart,
  ThemeRiverChart,
  TreemapChart,
  GridComponent,
  DataZoomComponent,
  LegendComponent,
  ParallelComponent,
  SingleAxisComponent,
  TooltipComponent,
  VisualMapComponent,
  CanvasRenderer,
]);

export { echarts };
export default echarts;
export * from "echarts/core";
