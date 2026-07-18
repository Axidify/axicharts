"use client";

import { useEffect, useMemo, useRef } from "react";
import type { ReactElement } from "react";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";
import type { ChartTheme } from "@axicharts/charts-theme";
import { CANVAS_BG, chromeGridStroke } from "./colors";
import type { PlotSeries } from "./types";
import {
  brushRangeFromIndices,
  indicesFromBrushRange,
  type BrushRangePercent,
} from "./brushRangePercent";

export const RANGE_OVERVIEW_HEIGHT = 22;

export type UPlotRangeOverviewProps = {
  width: number;
  categories: string[];
  series: PlotSeries[];
  theme: ChartTheme;
  range: BrushRangePercent;
  onRangeChange: (range: BrushRangePercent) => void;
};

function buildData(categories: string[], series: PlotSeries[]): uPlot.AlignedData {
  const primary = series[0]?.data ?? [];
  return [categories.map((_, index) => index), primary];
}

function buildOptions(
  width: number,
  theme: ChartTheme,
  total: number,
  onRangeChange: (range: BrushRangePercent) => void,
  applyingRangeRef: React.MutableRefObject<boolean>,
): uPlot.Options {
  const dark = theme.name === "live" || theme.name === "industrial";

  return {
    width,
    height: RANGE_OVERVIEW_HEIGHT,
    pxAlign: 0,
    cursor: { show: false },
    select: { show: true, left: 0, top: 0, width: 0, height: RANGE_OVERVIEW_HEIGHT },
    legend: { show: false },
    padding: [2, 4, 2, 4],
    series: [
      {},
      {
        stroke: dark ? "#64748b" : "#94a3b8",
        width: 1,
        fill: dark ? "rgba(100, 116, 139, 0.35)" : "rgba(148, 163, 184, 0.35)",
      },
    ],
    axes: [{ show: false }, { show: false }],
    scales: {
      x: { time: false },
      y: { auto: true },
    },
    hooks: {
      setSelect: [
        (u: uPlot) => {
          if (total <= 0 || applyingRangeRef.current) return;
          const count = total;
          const startIdx = Math.max(0, u.posToIdx(u.select.left));
          const endIdx = Math.min(
            count - 1,
            Math.max(startIdx, u.posToIdx(u.select.left + u.select.width)),
          );
          onRangeChange(brushRangeFromIndices(startIdx, endIdx, count));
        },
      ],
    },
  };
}

export function UPlotRangeOverview({
  width,
  categories,
  series,
  theme,
  range,
  onRangeChange,
}: UPlotRangeOverviewProps): ReactElement | null {
  const rootRef = useRef<HTMLDivElement>(null);
  const plotRef = useRef<uPlot | null>(null);
  const onRangeChangeRef = useRef(onRangeChange);
  const applyingRangeRef = useRef(false);
  onRangeChangeRef.current = onRangeChange;

  const total = categories.length;
  const data = useMemo(() => buildData(categories, series), [categories, series]);

  const options = useMemo(
    () =>
      buildOptions(width, theme, total, (next) => {
        if (applyingRangeRef.current) return;
        onRangeChangeRef.current(next);
      }, applyingRangeRef),
    [width, theme, total],
  );

  useEffect(() => {
    if (!rootRef.current || width < 1 || total === 0) return;

    plotRef.current?.destroy();
    plotRef.current = new uPlot(options, data, rootRef.current);

    return () => {
      plotRef.current?.destroy();
      plotRef.current = null;
    };
  }, [options, data, width, total]);

  useEffect(() => {
    const plot = plotRef.current;
    if (!plot || total === 0) return;

    plot.setData(data);
  }, [data, total]);

  useEffect(() => {
    const plot = plotRef.current;
    if (!plot || total === 0) return;

    const { startIndex, endIndex } = indicesFromBrushRange(range, total);
    applyingRangeRef.current = true;
    const left = plot.valToPos(startIndex, "x", true);
    const right = plot.valToPos(endIndex, "x", true);
    plot.setSelect({
      left,
      top: 0,
      width: Math.max(1, right - left),
      height: RANGE_OVERVIEW_HEIGHT,
    });
    queueMicrotask(() => {
      applyingRangeRef.current = false;
    });
  }, [range, total]);

  if (width < 1 || total === 0) {
    return null;
  }

  return (
    <div
      ref={rootRef}
      style={{
        width,
        height: RANGE_OVERVIEW_HEIGHT,
        background: CANVAS_BG,
        borderTop: `1px solid ${chromeGridStroke(theme, true)}`,
        overflow: "hidden",
      }}
    />
  );
}
