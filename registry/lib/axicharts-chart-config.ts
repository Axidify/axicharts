import type { ChartConfig } from "@axicharts/charts";

/** Default shadcn-compatible series labels/colors for admin dashboards. */
export const adminChartConfig = {
  desktop: { label: "Desktop", color: "hsl(var(--chart-1))" },
  mobile: { label: "Mobile", color: "hsl(var(--chart-2))" },
  tablet: { label: "Tablet", color: "hsl(var(--chart-3))" },
} satisfies ChartConfig;

export type { ChartConfig };
