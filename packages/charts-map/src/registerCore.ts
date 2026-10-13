import type { ComponentType } from "react";
import { registerChartType } from "@axicharts/charts/registry";
import { MapChart } from "./MapChart";

let registered = false;

export function registerMapChart(): void {
  if (registered) return;

  registerChartType({
    type: "map",
    Chart: MapChart as ComponentType<Record<string, unknown>>,
    defaultRenderer: "svg",
    fromSpec: ({ props, data }) => ({
      topology: props.topology ?? data.topology,
      values: props.values ?? data.values ?? {},
      objectKey: props.objectKey,
      featureId: props.featureId,
      nameKey: props.nameKey,
      projection: props.projection,
      min: props.min,
      max: props.max,
      showLabels: props.showLabels,
      showScale: props.showScale,
      surface: props.surface,
      drilldown: props.drilldown,
      hierarchy: props.hierarchy,
      drillPath: props.drillPath,
      drillLabels: props.drillLabels,
    }),
  });

  registered = true;
}
