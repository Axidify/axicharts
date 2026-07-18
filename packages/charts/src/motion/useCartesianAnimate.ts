"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useChartLayout } from "../container/ChartLayoutContext";
import type { ChartAnimate, CartesianMotionKind } from "./types";
import {
  resolveChartAnimate,
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
};

export type UseCartesianAnimateResult = {
  plotStyle: CSSProperties | undefined;
  plotKey: string;
  skipPresentationPlotEnter: boolean;
};

export function useCartesianAnimate({
  animate,
  kind,
  dataSignature,
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

  const plotStyle = useMemo((): CSSProperties | undefined => {
    if (enterEnabled && resolved.enter) {
      return cartesianEnterStyle(kind, resolved.enter, {
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
    updateEnabled,
    updateTick,
  ]);

  const plotKey = enterEnabled ? `enter-${dataSignature}` : `plot-${updateTick}`;

  return {
    plotStyle,
    plotKey,
    skipPresentationPlotEnter: explicitAnimate && enterEnabled,
  };
}
