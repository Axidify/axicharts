import type { ChartTypeRegistration } from "./types";

const chartTypes = new Map<string, ChartTypeRegistration>();

export function registerChartType(registration: ChartTypeRegistration): void {
  const key = registration.type.trim();
  if (!key) {
    throw new Error("[AxiCharts] registerChartType: type is required");
  }
  if (chartTypes.has(key)) {
    throw new Error(`[AxiCharts] Chart type "${key}" is already registered`);
  }
  chartTypes.set(key, registration);
}

export function getChartType(type: string): ChartTypeRegistration | undefined {
  return chartTypes.get(type);
}

export function listChartTypes(): string[] {
  return [...chartTypes.keys()];
}

export function clearChartTypes(): void {
  chartTypes.clear();
}
