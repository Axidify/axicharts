import { useContext } from "react";
import { ChartLayoutContext, type ChartLayoutContextValue } from "./ChartLayoutContext";

export function useOptionalChartLayout(): ChartLayoutContextValue | null {
  return useContext(ChartLayoutContext);
}
