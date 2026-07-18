"use client";

import { useEffect, useMemo, useRef } from "react";
import type { ReactElement } from "react";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";
import type { ChartTheme } from "@axicharts/charts-theme";
import { CANVAS_BG, chromeGridStroke, isDarkChartTheme } from "./colors";
import type { PlotSeries } from "./types";
import {
  brushRangeFromIndicesWithMinGuard,
  indicesFromBrushRange,
  normalizeBrushRangePercent,
  type BrushRangePercent,
  DEFAULT_BRUSH_MIN_RANGE_PERCENT,
} from "./brushRangePercent";

export const RANGE_OVERVIEW_HEIGHT = 24;

const OVERVIEW_SELECT_STYLES = `
.axicharts-range-overview .uplot .u-select {
  background: var(--axicharts-brush-fill, rgba(59, 130, 246, 0.18)) !important;
  border-left: 2px solid var(--axicharts-brush-handle, rgba(59, 130, 246, 0.85));
  border-right: 2px solid var(--axicharts-brush-handle, rgba(59, 130, 246, 0.85));
}
.axicharts-range-overview .uplot .u-over {
  cursor: crosshair;
}
`;

export type UPlotRangeOverviewProps = {
  width: number;
  categories: string[];
  series: PlotSeries[];
  theme: ChartTheme;
  range: BrushRangePercent;
  onRangeChange: (range: BrushRangePercent) => void;
  /** Minimum brush span as percent of domain; prevents collapsing the window on drag. */
  minRangePercent?: number;
  /** DOM id for aria-controls from preset toolbar buttons. */
  overviewId?: string;
};

function buildData(categories: string[], series: PlotSeries[]): uPlot.AlignedData {
  const primary = series[0]?.data ?? [];
  return [categories.map((_, index) => index), primary];
}

function buildOptions(
  width: number,
  theme: ChartTheme,
  total: number,
  minRangePercent: number,
  onRangeChange: (range: BrushRangePercent) => void,
  applyingRangeRef: React.MutableRefObject<boolean>,
): uPlot.Options {
  const dark = isDarkChartTheme(theme.name);

  return {
    width,
    height: RANGE_OVERVIEW_HEIGHT,
    pxAlign: 0,
    cursor: { show: false },
    select: {
      show: true,
      left: 0,
      top: 0,
      width: 0,
      height: RANGE_OVERVIEW_HEIGHT,
    },
    legend: { show: false },
    padding: [2, 6, 2, 6],
    series: [
      {},
      {
        stroke: dark ? "#64748b" : "#94a3b8",
        width: 1,
        fill: dark ? "rgba(100, 116, 139, 0.4)" : "rgba(148, 163, 184, 0.38)",
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
          const next = brushRangeFromIndicesWithMinGuard(
            startIdx,
            endIdx,
            count,
            minRangePercent,
          );
          onRangeChange(next);
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
  minRangePercent = DEFAULT_BRUSH_MIN_RANGE_PERCENT,
  overviewId,
}: UPlotRangeOverviewProps): ReactElement | null {
  const rootRef = useRef<HTMLDivElement>(null);
  const plotRef = useRef<uPlot | null>(null);
  const onRangeChangeRef = useRef(onRangeChange);
  const applyingRangeRef = useRef(false);
  onRangeChangeRef.current = onRangeChange;

  const total = categories.length;
  const data = useMemo(() => buildData(categories, series), [categories, series]);
  const dark = isDarkChartTheme(theme.name);

  const options = useMemo(
    () =>
      buildOptions(
        width,
        theme,
        total,
        minRangePercent,
        (next) => {
          if (applyingRangeRef.current) return;
          onRangeChangeRef.current(normalizeBrushRangePercent(next, minRangePercent));
        },
        applyingRangeRef,
      ),
    [width, theme, total, minRangePercent],
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

    const normalized = normalizeBrushRangePercent(range, minRangePercent);
    const { startIndex, endIndex } = indicesFromBrushRange(normalized, total);
    applyingRangeRef.current = true;
    const left = plot.valToPos(startIndex, "x", true);
    const right = plot.valToPos(endIndex, "x", true);
    plot.setSelect({
      left,
      top: 0,
      width: Math.max(2, right - left),
      height: RANGE_OVERVIEW_HEIGHT,
    });
    queueMicrotask(() => {
      applyingRangeRef.current = false;
    });
  }, [range, total, minRangePercent]);

  if (width < 1 || total === 0) {
    return null;
  }

  return (
    <>
      <style>{OVERVIEW_SELECT_STYLES}</style>
      <div
        ref={rootRef}
        id={overviewId}
        className="axicharts-range-overview"
        role="group"
        aria-label="Chart range overview"
        style={{
          width,
          height: RANGE_OVERVIEW_HEIGHT,
          background: CANVAS_BG,
          borderTop: `1px solid ${chromeGridStroke(theme, true)}`,
          overflow: "hidden",
          ["--axicharts-brush-fill" as string]: dark
            ? "rgba(96, 165, 250, 0.2)"
            : "rgba(59, 130, 246, 0.16)",
          ["--axicharts-brush-handle" as string]: dark
            ? "rgba(147, 197, 253, 0.95)"
            : "rgba(37, 99, 235, 0.9)",
        }}
      />
    </>
  );
}
