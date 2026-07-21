import type { PieCenterMetricInput } from "@axicharts/charts-echarts";

export type PanelCenterMetricSpec =
  | "largest"
  | {
      value: string;
      label?: string;
    }
  | {
      slice: string;
    };

export function readPanelCenterMetric(
  props: Record<string, unknown> | undefined,
  slices: { name: string; value: number }[],
): PieCenterMetricInput | undefined {
  const raw = props?.centerMetric as PanelCenterMetricSpec | undefined;
  if (raw == null) return undefined;

  if (raw === "largest") return "largest";

  if (typeof raw === "object" && "value" in raw && typeof raw.value === "string") {
    return {
      value: raw.value,
      ...(typeof raw.label === "string" ? { label: raw.label } : {}),
    };
  }

  if (typeof raw === "object" && "slice" in raw && typeof raw.slice === "string") {
    const slice = slices.find((item) => item.name === raw.slice);
    if (!slice) return undefined;
    const total = slices.reduce((sum, item) => sum + item.value, 0);
    if (total <= 0) return undefined;
    return {
      value: `${Math.round((slice.value / total) * 100)}%`,
      label: slice.name,
    };
  }

  return undefined;
}
