import type { PlotSeries } from "@axicharts/charts-canvas";
import type { ComboSeries } from "@axicharts/charts-canvas";
import type { CartesianA11yDescriptor } from "./types";

export type BuildCartesianA11yInput = {
  chartType: CartesianA11yDescriptor["chartType"];
  categories: string[];
  series: PlotSeries[] | ComboSeries[];
  title?: string;
  description?: string;
  categoryLabel?: string;
};

export function buildCartesianA11yDescriptor({
  chartType,
  categories,
  series,
  title,
  description,
  categoryLabel = "Category",
}: BuildCartesianA11yInput): CartesianA11yDescriptor {
  return {
    kind: "cartesian",
    chartType,
    title: title ?? series.map((item) => item.name).join(", "),
    description,
    categoryLabel,
    categories: [...categories],
    series: series.map((item) => ({
      name: item.name,
      values: item.data.map((value) => (Number.isFinite(value) ? value : 0)),
    })),
  };
}

export function cartesianA11ySummary(descriptor: CartesianA11yDescriptor): string {
  const seriesNames = descriptor.series.map((item) => item.name).join(", ");
  return `${descriptor.chartType} chart with ${descriptor.categories.length} categories and series: ${seriesNames}`;
}
