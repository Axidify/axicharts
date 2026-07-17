"use client";

import type { CSSProperties, ReactElement, ReactNode } from "react";
import { useEffect } from "react";
import { resolveSize } from "@axicharts/charts-core";
import {
  cleanTheme,
  type ChartTheme,
} from "@axicharts/charts-theme";
import {
  ChartLayoutContext,
  type ChartConfig,
} from "./ChartLayoutContext";
import { useResizeObserver } from "./useResizeObserver";

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
  onResize?: (size: { width: number; height: number }) => void;
};

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
  onResize,
}: ChartContainerProps): ReactElement {
  const [ref, measured] = useResizeObserver(debounceMs);

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
      value={{ size, ready, theme, config, mode }}
    >
      <div
        ref={ref}
        className={className}
        style={{
          width,
          minHeight,
          maxHeight,
          position: "relative",
          ...style,
        }}
      >
        {ready ? (
          children
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
