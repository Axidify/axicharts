import { registerGanttChart } from "@axicharts/charts-gantt";
import { registerGeoChart } from "@axicharts/charts-geo";
import { registerMapChart } from "@axicharts/charts-map";
import { registerSankeyChart } from "@axicharts/charts-sankey";
import { registerTankChart } from "@axicharts/charts-tank";
import { registerAndonChart } from "@axicharts/charts-andon";
import { registerEChartsOptionChart } from "@axicharts/charts";

let pluginsRegistered = false;

/** Register sankey, geo, map, gantt, tank, andon, and echarts escape hatch for compilePanel / registry. */
export function registerPluginChartTypes(): void {
  if (pluginsRegistered) return;

  registerSankeyChart();
  registerGeoChart();
  registerMapChart();
  registerGanttChart();
  registerTankChart();
  registerAndonChart();
  registerEChartsOptionChart();

  pluginsRegistered = true;
}
