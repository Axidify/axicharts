import { registerGanttChart } from "@axicharts/charts-gantt";
import { registerGeoChart } from "@axicharts/charts-geo";
import { registerSankeyChart } from "@axicharts/charts-sankey";

let pluginsRegistered = false;

/** Register sankey, geo, and gantt community chart types for compilePanel / registry. */
export function registerPluginChartTypes(): void {
  if (pluginsRegistered) return;

  registerSankeyChart();
  registerGeoChart();
  registerGanttChart();

  pluginsRegistered = true;
}
