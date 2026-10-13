import { isDarkTheme } from "@axicharts/charts-theme";
import { useOptionalChartLayout } from "./useOptionalChartLayout";

/**
 * Default `surface` for KPI / panel components (Stat, Digital, AlertPanel,
 * MarkdownPanel, DataTable). Inside a ChartContainer it follows the theme, so
 * light themes no longer get pale dark-surface text; standalone it keeps the
 * historical `"dark"` default.
 */
export function useDefaultSurface(): "dark" | "light" {
  const layout = useOptionalChartLayout();
  if (!layout) return "dark";
  return isDarkTheme(layout.theme) ? "dark" : "light";
}
