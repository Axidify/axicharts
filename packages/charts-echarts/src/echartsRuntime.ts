import {
  BarChart,
  BoxplotChart,
  CandlestickChart,
  FunnelChart,
  GraphChart,
  HeatmapChart,
  LineChart,
  ParallelChart,
  PieChart,
  PictorialBarChart,
  RadarChart,
  ScatterChart,
  SunburstChart,
  ThemeRiverChart,
  TreemapChart,
} from "echarts/charts";
import {
  AxisPointerComponent,
  CalendarComponent,
  DataZoomComponent,
  DatasetComponent,
  GridComponent,
  LegendComponent,
  MarkLineComponent,
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
  GraphChart,
  HeatmapChart,
  LineChart,
  ParallelChart,
  PieChart,
  PictorialBarChart,
  RadarChart,
  ScatterChart,
  SunburstChart,
  ThemeRiverChart,
  TreemapChart,
  GridComponent,
  DataZoomComponent,
  LegendComponent,
  AxisPointerComponent,
  MarkLineComponent,
  ParallelComponent,
  SingleAxisComponent,
  TooltipComponent,
  VisualMapComponent,
  CalendarComponent,
  CanvasRenderer,
]);

export { echarts };
export default echarts;
export * from "echarts/core";
