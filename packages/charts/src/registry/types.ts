import type { ComponentType } from "react";

export type ChartRenderer = "svg" | "canvas";

export type ChartTypeRegistration = {
  type: string;
  Chart: ComponentType<Record<string, unknown>>;
  defaultRenderer?: ChartRenderer;
};
