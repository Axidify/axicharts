"use client";

import { useEffect, useMemo, useRef } from "react";
import type { ReactElement } from "react";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";
import {
  AXIS_COLOR,
  CANVAS_BG,
  GRID_COLOR,
  withAlpha,
} from "./colors";
import type { UPlotLineProps } from "./types";
import { applySyncedCursor } from "./plotCursor";
import { shouldStackSeries, STACK_GROUP } from "./stack";
import { resolveSeriesColor } from "./seriesColor";

function seriesSpan(data: number[]): number {
  if (data.length === 0) return 1;
  const max = Math.max(...data);
  const min = Math.min(...data);
  return max - min || max || 1;
}

function shouldUseDualAxis(
  series: UPlotLineProps["series"],
  dualAxis: UPlotLineProps["dualAxis"],
): boolean {
  if (series.length < 2) return false;
  if (dualAxis === true) return true;
  if (dualAxis === false) return false;

  const spans = series.map((item) => seriesSpan(item.data));
  const hi = Math.max(...spans);
  const lo = Math.min(...spans);
  return hi / lo > 3;
}

function buildOptions({
  width,
  height,
  categories,
  series,
  theme,
  fill,
  showAxes = true,
  dualAxis = "auto",
  stacked = false,
  showCursor = false,
  useNativeLegend = true,
}: UPlotLineProps): uPlot.Options {
  const compact = height < 72;
  const gridOpacity = compact
    ? Math.min(theme.grid.opacity + 0.35, 0.95)
    : theme.grid.opacity;
  const gridStroke = withAlpha(GRID_COLOR, gridOpacity);
  const gridWidth = compact ? 1 : theme.grid.strokeWidth;

  const compactYGrid = {
    stroke: gridStroke,
    width: gridWidth,
  };

  const compactSplits = compact
    ? (_u: uPlot, axisIdx: number, min: number, max: number) => {
        if (axisIdx !== 1) return [];
        const span = max - min || 1;
        return [min + span * 0.25, min + span * 0.5, min + span * 0.75];
      }
    : undefined;

  const fillOpacity = compact
    ? Math.min(theme.area.fillOpacity + 0.12, 0.35)
    : theme.area.fillOpacity;

  const useDualAxis = shouldStackSeries(stacked, series.length)
    ? false
    : shouldUseDualAxis(series, dualAxis);
  const showLegend = useNativeLegend && series.length > 1;
  const topPad = showLegend && !compact ? 28 : compact ? 4 : 8;

  return {
    width,
    height,
    class: "axicharts-uplot",
    padding: compact ? [4, 6, 4, 6] : [topPad, 10, 8, useDualAxis ? 48 : 10],
    cursor: {
      show: showCursor,
      x: true,
      y: false,
      points: { show: false },
    },
    legend: { show: showLegend },
    scales: {
      x: { time: false },
      y: { auto: true },
      ...(useDualAxis ? { y2: { auto: true } } : {}),
    },
    axes: showAxes
      ? [
          {
            stroke: AXIS_COLOR,
            grid: theme.grid.vertical
              ? { stroke: gridStroke, width: gridWidth }
              : { show: false },
            ticks: { show: false },
            values: (_u, ticks) =>
              ticks.map((tick) => categories[tick] ?? ""),
            size: compact ? 0 : 18,
            font: "11px ui-sans-serif, system-ui, sans-serif",
          },
          {
            scale: "y",
            side: 3,
            stroke: AXIS_COLOR,
            grid: theme.grid.horizontal ? compactYGrid : { show: false },
            splits: compactSplits,
            ticks: { show: false },
            size: compact ? 0 : 32,
            font: theme.values.monospace
              ? "11px ui-monospace, SFMono-Regular, Menlo, monospace"
              : "11px ui-sans-serif, system-ui, sans-serif",
          },
          ...(useDualAxis
            ? [
                {
                  scale: "y2",
                  side: 1,
                  stroke: AXIS_COLOR,
                  grid: { show: false },
                  ticks: { show: false },
                  size: 32,
                  font: theme.values.monospace
                    ? "11px ui-monospace, SFMono-Regular, Menlo, monospace"
                    : "11px ui-sans-serif, system-ui, sans-serif",
                },
              ]
            : []),
        ]
      : [
          {
            show: false,
            splits: compactSplits,
            grid: theme.grid.horizontal ? compactYGrid : { show: false },
          },
          {
            show: false,
            splits: compactSplits,
            grid: theme.grid.horizontal ? compactYGrid : { show: false },
          },
        ],
    series: [
      {},
      ...series.map((item, index) => {
        const color = resolveSeriesColor(item.tone, index);
        const stackSeries = shouldStackSeries(stacked, series.length);
        return {
          label: item.name,
          scale: useDualAxis && index > 0 ? "y2" : "y",
          stroke: color,
          width: theme.line.strokeWidth,
          fill: fill && theme.area.show ? withAlpha(color, fillOpacity) : undefined,
          stack: stackSeries ? STACK_GROUP : undefined,
          points: { show: false },
        };
      }),
    ],
  };
}

function buildData(categories: string[], series: UPlotLineProps["series"]) {
  const x = categories.map((_, index) => index);
  return [x, ...series.map((item) => item.data)] as uPlot.AlignedData;
}

export function UPlotLine(props: UPlotLineProps): ReactElement {
  const {
    width,
    height,
    categories,
    series,
    theme,
    fill,
    showAxes,
    dualAxis,
    stacked,
    showCursor,
    useNativeLegend,
    onCursor,
    onSyncIndex,
    syncIndex,
    syncSourceId,
    chartId,
  } = props;
  const rootRef = useRef<HTMLDivElement>(null);
  const plotRef = useRef<uPlot | null>(null);
  const onCursorRef = useRef(onCursor);
  const onSyncIndexRef = useRef(onSyncIndex);
  const applyingSyncRef = useRef(false);
  onCursorRef.current = onCursor;
  onSyncIndexRef.current = onSyncIndex;

  const options = useMemo(() => {
    const base = buildOptions(props);
    if (!showCursor && !onSyncIndexRef.current) {
      return base;
    }

    return {
      ...base,
      hooks: {
        ...base.hooks,
        setCursor: [
          (u: uPlot) => {
            const idx = u.cursor.idx;
            const event =
              idx == null || idx < 0
                ? null
                : {
                    index: idx,
                    left: u.cursor.left ?? 0,
                    top: u.cursor.top ?? 0,
                  };

            if (!applyingSyncRef.current) {
              onSyncIndexRef.current?.(
                idx == null || idx < 0 ? null : idx,
              );
            }
            onCursorRef.current?.(event);
          },
        ],
      },
    };
  }, [
    width,
    height,
    categories,
    series,
    theme,
    fill,
    showAxes,
    dualAxis,
    stacked,
    showCursor,
    useNativeLegend,
    onCursor,
    onSyncIndex,
  ]);

  const data = useMemo(
    () => buildData(categories, series),
    [categories, series],
  );

  useEffect(() => {
    if (!rootRef.current || width < 1 || height < 1) return;

    plotRef.current?.destroy();
    plotRef.current = new uPlot(options, data, rootRef.current);

    return () => {
      plotRef.current?.destroy();
      plotRef.current = null;
    };
  }, [options, data, width, height]);

  useEffect(() => {
    if (!plotRef.current) return;
    plotRef.current.setData(data);
  }, [data]);

  useEffect(() => {
    if (!plotRef.current) return;
    plotRef.current.setSize({ width, height });
  }, [width, height]);

  useEffect(() => {
    const plot = plotRef.current;
    if (!plot || !chartId) return;
    if (syncSourceId === chartId) return;

    applyingSyncRef.current = true;
    applySyncedCursor(plot, syncIndex);
    applyingSyncRef.current = false;
  }, [syncIndex, syncSourceId, chartId]);

  return (
    <div
      ref={rootRef}
      style={{
        width,
        height,
        background: CANVAS_BG,
        overflow: "hidden",
      }}
    />
  );
}
