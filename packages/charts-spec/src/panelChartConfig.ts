import type { ChartConfig } from "@axicharts/charts";
import type { ChartConfigSpec } from "./types";

export function readPanelChartConfig(
  props?: Record<string, unknown>,
): ChartConfigSpec | undefined {
  const chartConfig = props?.chartConfig;
  if (!chartConfig || typeof chartConfig !== "object" || Array.isArray(chartConfig)) {
    return undefined;
  }
  return chartConfig as ChartConfigSpec;
}

export function chartPropsWithoutChartConfig(
  props: Record<string, unknown>,
): Record<string, unknown> {
  const { chartConfig: _chartConfig, ...chartProps } = props;
  return chartProps;
}

export function toChartConfig(config?: ChartConfigSpec): ChartConfig | undefined {
  if (!config) return undefined;
  return config as ChartConfig;
}
