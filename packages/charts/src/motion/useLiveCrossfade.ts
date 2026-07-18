"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { ChartMode } from "@axicharts/charts-core";
import {
  ensureLiveCrossfadeStyles,
  liveCrossfadeStyle,
  LIVE_CROSSFADE_MS,
} from "./styles";

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export type UseLiveCrossfadeInput = {
  enabled: boolean;
  structureSignature: string;
  mode: ChartMode;
};

export type UseLiveCrossfadeResult = {
  plotStyle: CSSProperties | undefined;
  crossfadeTick: number;
};

export function useLiveCrossfade({
  enabled,
  structureSignature,
  mode,
}: UseLiveCrossfadeInput): UseLiveCrossfadeResult {
  const active =
    enabled && mode === "live" && !prefersReducedMotion();
  const mountedRef = useRef(false);
  const prevSignatureRef = useRef(structureSignature);
  const [crossfadeTick, setCrossfadeTick] = useState(0);

  useEffect(() => {
    if (active) {
      ensureLiveCrossfadeStyles();
    }
  }, [active]);

  useEffect(() => {
    if (!active) {
      prevSignatureRef.current = structureSignature;
      return;
    }
    if (!mountedRef.current) {
      mountedRef.current = true;
      prevSignatureRef.current = structureSignature;
      return;
    }
    if (structureSignature === prevSignatureRef.current) {
      return;
    }
    prevSignatureRef.current = structureSignature;
    setCrossfadeTick((tick) => tick + 1);
  }, [active, structureSignature]);

  const plotStyle = useMemo((): CSSProperties | undefined => {
    if (!active || crossfadeTick === 0) return undefined;
    return liveCrossfadeStyle(LIVE_CROSSFADE_MS);
  }, [active, crossfadeTick]);

  return { plotStyle, crossfadeTick };
}
