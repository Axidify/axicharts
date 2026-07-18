import { registerGanttChart } from "@axicharts/charts-gantt";
import { registerGeoChart } from "@axicharts/charts-geo";
import { registerMapChart } from "@axicharts/charts-map";
import { registerSankeyChart } from "@axicharts/charts-sankey";
import { registerEChartsOptionChart } from "@axicharts/charts";

let pluginsRegistered = false;

/** Register sankey, geo, map, gantt, and echarts escape hatch for compilePanel / registry. */
export function registerPluginChartTypes(): void {
  if (pluginsRegistered) return;

  registerSankeyChart();
  registerGeoChart();
  registerMapChart();
  registerGanttChart();
  registerEChartsOptionChart();

  pluginsRegistered = true;
}
