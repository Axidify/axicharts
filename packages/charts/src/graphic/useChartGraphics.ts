import { useMemo, type ReactNode } from "react";
import type { ChartGraphicElement } from "@axicharts/charts-canvas";
import { composeChartGraphics } from "../composable/composeChartGraphics";

export function useChartGraphics({
  graphics,
  children,
}: {
  graphics?: ChartGraphicElement[];
  children?: ReactNode;
}): ChartGraphicElement[] {
  const composed = useMemo(() => composeChartGraphics(children), [children]);

  return useMemo(() => {
    if (composed.length === 0 && !graphics?.length) {
      return [];
    }
    return [...composed, ...(graphics ?? [])];
  }, [composed, graphics]);
}
