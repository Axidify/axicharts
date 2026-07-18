"use client";

import { useMemo } from "react";
import {
  resolveRenderer,
  type RendererPreference,
} from "@axicharts/charts-core";
import { useChartLayout } from "../container/ChartLayoutContext";

export function usePlotRenderer({
  pointCount,
  renderer = "auto",
  refreshHz,
  forceCanvas = false,
}: {
  pointCount: number;
  renderer?: RendererPreference;
  refreshHz?: number;
  forceCanvas?: boolean;
}) {
  const { mode, size } = useChartLayout();

  return useMemo(() => {
    const resolved = resolveRenderer({
      renderer,
      mode,
      pointCount,
      plotWidth: size.width,
      refreshHz,
    });

    if (forceCanvas) {
      return { ...resolved, engine: "canvas" as const };
    }

    return resolved;
  }, [renderer, mode, pointCount, size.width, refreshHz, forceCanvas]);
}
