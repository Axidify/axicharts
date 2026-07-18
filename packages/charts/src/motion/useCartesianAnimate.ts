"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useChartLayout } from "../container/ChartLayoutContext";
import type { ChartAnimate, CartesianMotionKind } from "./types";
import {
  resolveChartAnimate,
  resolveSeriesEnterDelay,
  shouldAnimateEnter,
  shouldAnimateUpdate,
} from "./resolve";
import {
  cartesianEnterStyle,
  cartesianUpdateStyle,
  ensureCartesianMotionStyles,
} from "./styles";

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export type UseCartesianAnimateInput = {
  animate?: ChartAnimate;
  kind: CartesianMotionKind;
  dataSignature: string;
  seriesIndex?: number;
};

export type UseCartesianAnimateResult = {
  plotStyle: CSSProperties | undefined;
  plotClassName?: string;
  plotKey: string;
  skipPresentationPlotEnter: boolean;
  seriesEnterDelayMs?: (seriesIndex: number) => number;
};

export function useCartesianAnimate({
  animate,
  kind,
  dataSignature,
  seriesIndex,
}: UseCartesianAnimateInput): UseCartesianAnimateResult {
  const { mode } = useChartLayout();
  const resolved = useMemo(
    () => resolveChartAnimate(mode, animate),
    [animate, mode],
  );
  const reducedMotion = prefersReducedMotion();
  const enterEnabled = shouldAnimateEnter(resolved, { reducedMotion });
  const updateEnabled = shouldAnimateUpdate(resolved, mode, { reducedMotion });
  const mountedRef = useRef(false);
  const prevSignatureRef = useRef(dataSignature);
  const [updateTick, setUpdateTick] = useState(0);

  useEffect(() => {
    if (enterEnabled || updateEnabled) {
      ensureCartesianMotionStyles();
    }
  }, [enterEnabled, updateEnabled]);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      prevSignatureRef.current = dataSignature;
      return;
    }
    if (!updateEnabled || dataSignature === prevSignatureRef.current) {
      prevSignatureRef.current = dataSignature;
      return;
    }
    prevSignatureRef.current = dataSignature;
    setUpdateTick((tick) => tick + 1);
  }, [dataSignature, updateEnabled]);

  const presentationMode = mode === "presentation";
  const explicitAnimate = animate != null;

  const plotClassName =
    enterEnabled &&
    resolved.enter &&
    (resolved.enter.staggerMs ?? 0) > 0 &&
    kind === "line"
      ? "axicharts-motion-line"
      : undefined;

  const plotStyle = useMemo((): CSSProperties | undefined => {
    if (enterEnabled && resolved.enter) {
      const enter =
        seriesIndex != null
          ? {
              ...resolved.enter,
              delay: resolveSeriesEnterDelay(resolved.enter, seriesIndex),
            }
          : resolved.enter;
      return cartesianEnterStyle(kind, enter, {
        presentationMode: presentationMode && explicitAnimate,
      });
    }
    if (updateEnabled && updateTick > 0 && resolved.update) {
      const duration =
        typeof resolved.update.easing === "object"
          ? resolved.update.easing.duration ?? resolved.update.duration ?? 220
          : resolved.update.duration ?? 220;
      return cartesianUpdateStyle(duration);
    }
    return undefined;
  }, [
    enterEnabled,
    explicitAnimate,
    kind,
    presentationMode,
    resolved.enter,
    resolved.update,
    seriesIndex,
    updateEnabled,
    updateTick,
  ]);

  const seriesEnterDelayMs = useMemo(() => {
    if (!enterEnabled || !resolved.enter) return undefined;
    const staggerMs = resolved.enter.staggerMs ?? 0;
    if (staggerMs <= 0) return undefined;
    return (index: number) => resolveSeriesEnterDelay(resolved.enter!, index);
  }, [enterEnabled, resolved.enter]);

  const plotKey = enterEnabled ? `enter-${dataSignature}` : `plot-${updateTick}`;

  return {
    plotStyle,
    plotClassName,
    plotKey,
    skipPresentationPlotEnter: explicitAnimate && enterEnabled,
    seriesEnterDelayMs,
  };
}
