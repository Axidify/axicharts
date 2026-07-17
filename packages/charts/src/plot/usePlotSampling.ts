"use client";

import { useMemo } from "react";
import { resolveRenderer, type RendererPreference } from "@axicharts/charts-core";
import { useChartLayout } from "../container/ChartLayoutContext";

export function usePlotSampling({
  pointCount,
  renderer = "auto",
  refreshHz,
}: {
  pointCount: number;
  renderer?: RendererPreference;
  refreshHz?: number;
}): number | null {
  const { mode, size } = useChartLayout();

  return useMemo(() => {
    return resolveRenderer({
      renderer,
      mode,
      pointCount,
      plotWidth: size.width,
      refreshHz,
    }).maxPoints;
  }, [renderer, mode, pointCount, size.width, refreshHz]);
}
