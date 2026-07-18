"use client";

import { useMemo } from "react";
import { usePlotRenderer } from "./usePlotRenderer";

export function usePlotSampling({
  pointCount,
  renderer = "auto",
  refreshHz,
  forceCanvas = false,
}: {
  pointCount: number;
  renderer?: import("@axicharts/charts-core").RendererPreference;
  refreshHz?: number;
  forceCanvas?: boolean;
}): number | null {
  return usePlotRenderer({
    pointCount,
    renderer,
    refreshHz,
    forceCanvas,
  }).maxPoints;
}
