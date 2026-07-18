"use client";

import { useEffect, useState } from "react";
import "./echartsRuntime";

let liquidFillReady = false;
let liquidFillLoading: Promise<void> | null = null;

function loadLiquidFillExtension(): Promise<void> {
  if (liquidFillReady) {
    return Promise.resolve();
  }
  if (!liquidFillLoading) {
    liquidFillLoading = import("echarts-liquidfill").then(() => {
      liquidFillReady = true;
    });
  }
  return liquidFillLoading;
}

export function useLiquidFillExtension(): boolean {
  const [ready, setReady] = useState(liquidFillReady);

  useEffect(() => {
    if (liquidFillReady) {
      setReady(true);
      return;
    }

    let cancelled = false;
    void loadLiquidFillExtension().then(() => {
      if (!cancelled) {
        setReady(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return ready;
}

export function __resetLiquidFillExtensionForTests(): void {
  liquidFillReady = false;
  liquidFillLoading = null;
}
