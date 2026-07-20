"use client";

import type { CSSProperties, ReactElement, ReactNode } from "react";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { resolveSize } from "@axicharts/charts-core";
import {
  cleanTheme,
  resolveThemeTokens,
  type ChartTheme,
} from "@axicharts/charts-theme";
import type { SeriesTone } from "@axicharts/charts-canvas";
import type { LegendVariant, TooltipVariant } from "../chrome/chromeVariants";
import {
  ChartLayoutContext,
  type ChartConfig,
} from "./ChartLayoutContext";
import { useResizeObserver } from "./useResizeObserver";
import {
  ChartStateOverlay,
  StaleBadge,
  useIsStale,
  type ChartDataState,
} from "../state";
import type { ChartAnimate, LiveAnimate } from "../motion/types";
import {
  ensurePresentationStyles,
  presentationEnterStyle,
} from "../presentation/motion";
import { resolveChartAnimate } from "../motion/resolve";
import { useChromeInsets } from "./useChromeInsets";
import "../chrome/chartChrome.css";

export type { ChartDataState };

export type ChartContainerProps = {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  width?: number | string;
  height?: number;
  minHeight?: number;
  maxHeight?: number;
  aspectRatio?: number;
  debounceMs?: number;
  theme?: ChartTheme;
  config?: ChartConfig;
  mode?: "static" | "interactive" | "live" | "presentation";
  syncId?: string;
  syncFollower?: string;
  dataState?: ChartDataState;
  staleAfterMs?: number;
  lastUpdatedAt?: number;
  loadingMessage?: string;
  emptyMessage?: string;
  errorMessage?: string;
  tagTones?: Record<string, SeriesTone>;
  legendVariant?: LegendVariant;
  tooltipVariant?: TooltipVariant;
  /** Chart-level animation default — cartesian charts may override. */
  animate?: ChartAnimate;
  /** Live-mode wholesale replace crossfade — default `"none"`. */
  liveAnimate?: LiveAnimate;
  /** When false, skip reading host `--chart-*` CSS vars (use theme tokens as-is). Default true. */
  inheritThemeTokens?: boolean;
  onResize?: (size: { width: number; height: number }) => void;
};

function isDarkTheme(theme: ChartTheme): boolean {
  return theme.name === "live" || theme.name === "industrial";
}

export function ChartContainer({
  children,
  className,
  style,
  width = "100%",
  height,
  minHeight = 200,
  maxHeight,
  aspectRatio,
  debounceMs = 50,
  theme = cleanTheme,
  config,
  mode = "interactive",
  syncId,
  syncFollower,
  dataState = "ready",
  staleAfterMs,
  lastUpdatedAt,
  loadingMessage,
  emptyMessage,
  errorMessage,
  tagTones,
  legendVariant,
  tooltipVariant,
  animate,
  liveAnimate = "none",
  inheritThemeTokens = true,
  onResize,
}: ChartContainerProps): ReactElement {
  const [ref, measured] = useResizeObserver(debounceMs);
  const [resolvedTheme, setResolvedTheme] = useState(theme);
  const { total: chromeInset, register: setChromeInset } = useChromeInsets();

  useLayoutEffect(() => {
    if (!inheritThemeTokens || !ref.current) {
      setResolvedTheme(theme);
      return;
    }
    setResolvedTheme(resolveThemeTokens(theme, ref.current));
  }, [theme, measured.width, measured.height, inheritThemeTokens]);
  const isStale = useIsStale(
    lastUpdatedAt,
    staleAfterMs,
    mode === "live" && dataState === "ready",
  );

  const size = resolveSize({
    width,
    height,
    minHeight,
    maxHeight,
    aspectRatio,
    measuredWidth: measured.width,
    measuredHeight: measured.height,
  });

  const ready = size.width >= 1 && size.height >= 1;
  const dark = isDarkTheme(resolvedTheme);
  const showStale = isStale && dataState === "ready";
  const contentHeight = height ?? minHeight;
  const resolvedAnimate = useMemo(
    () => resolveChartAnimate(mode, animate),
    [animate, mode],
  );
  const presentationEnterEnabled =
    mode === "presentation" &&
    dataState === "ready" &&
    animate !== "none" &&
    (animate == null || resolvedAnimate.enter != null);

  useEffect(() => {
    if (mode === "presentation") {
      ensurePresentationStyles();
    }
  }, [mode]);

  useEffect(() => {
    if (onResize && ready) {
      onResize(size);
    }
  }, [onResize, ready, size.width, size.height]);

  if (
    process.env.NODE_ENV !== "production" &&
    measured.width > 0 &&
    measured.height === 0 &&
    height === undefined &&
    aspectRatio === undefined
  ) {
    console.warn(
      "[AxiCharts] ChartContainer measured height is 0. Set minHeight, height, or aspectRatio, or ensure the parent layout defines height (e.g. flex-1 min-h-0).",
    );
  }

  return (
    <ChartLayoutContext.Provider
      value={{
        size,
        ready,
        theme: resolvedTheme,
        config,
        mode,
        liveAnimate,
        syncId,
        syncFollower,
        dataState,
        isStale: showStale,
        lastUpdatedAt,
        staleAfterMs,
        tagTones,
        legendVariant,
        tooltipVariant,
        emptyMessage,
        setChromeInset,
      }}
    >
      <div
        ref={ref}
        className={className}
        style={{
          width,
          height: height ?? undefined,
          minHeight:
            height === undefined ? minHeight + chromeInset : undefined,
          maxHeight: maxHeight != null ? maxHeight + chromeInset : undefined,
          paddingBottom: chromeInset > 0 ? chromeInset : undefined,
          position: "relative",
          boxSizing: "border-box",
          ...style,
        }}
      >
        {ready ? (
          <div
            style={{
              position: "relative",
              width: "100%",
              height: height ?? "100%",
              minHeight: height === undefined ? contentHeight : undefined,
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                opacity: showStale ? 0.55 : dataState === "ready" ? 1 : 0.35,
                filter: showStale ? "saturate(0.65)" : undefined,
                transition: "opacity 180ms ease",
                ...presentationEnterStyle(
                  presentationEnterEnabled,
                  animate != null ? resolvedAnimate.enter : null,
                ),
              }}
            >
              {children}
            </div>
            {dataState === "loading" ? (
              <ChartStateOverlay
                state="loading"
                message={loadingMessage}
                dark={dark}
              />
            ) : null}
            {dataState === "empty" ? (
              <ChartStateOverlay
                state="empty"
                message={emptyMessage}
                dark={dark}
              />
            ) : null}
            {dataState === "error" ? (
              <ChartStateOverlay
                state="error"
                message={errorMessage}
                dark={dark}
              />
            ) : null}
            {showStale ? <StaleBadge /> : null}
          </div>
        ) : (
          <div
            aria-hidden
            style={{
              width: "100%",
              height: minHeight,
              background: "transparent",
            }}
          />
        )}
      </div>
    </ChartLayoutContext.Provider>
  );
}
