"use client";

import { useEffect, useMemo, useRef } from "react";
import type { ReactElement } from "react";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";
import {
  CANVAS_BG,
  chromeGridStroke,
  createAreaGradient,
  resolveChromeColors,
} from "./colors";
import type { UPlotLineProps } from "./types";
import { shouldUseDualAxis } from "./dualAxis";
import { applySyncedCursor } from "./plotCursor";
import {
  createAnnotationDrawHook,
  expandYRange,
} from "./plotAnnotations";
import { shouldStackSeries, STACK_GROUP } from "./stack";
import { resolveSeriesColor } from "./seriesColor";
import {
  createSegmentedLineDrawHook,
  createVariablePointDrawHook,
  hasCustomLineDraw,
  hasSegmentedFills,
  segmentedSeriesPaths,
} from "./segmentedLineDraw";
import { lineSeriesPaths, resolveLineCurve } from "./linePaths";

function buildOptions({
  width,
  height,
  categories,
  series,
  theme,
  curve: curveOverride,
  fill,
  showAxes = true,
  dualAxis = "auto",
  stacked = false,
  thresholdBands = [],
  referenceLines = [],
  showCursor = false,
  useNativeLegend = true,
}: UPlotLineProps): uPlot.Options {
  const compact = height < 72;
  const chrome = resolveChromeColors(theme);
  const gridStroke = chromeGridStroke(theme, compact);
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
  const curve = resolveLineCurve(theme.line.curve, curveOverride);
  const smoothPaths =
    !shouldStackSeries(stacked, series.length) ? lineSeriesPaths(curve) : undefined;

  const useSegmentedFills =
    hasSegmentedFills(series) && !shouldStackSeries(stacked, series.length);
  const useCustomLineDraw =
    hasCustomLineDraw(series) && !shouldStackSeries(stacked, series.length);
  const defaultPointRadius = compact ? 3 : 4;
  const segmentedDraw = useCustomLineDraw
    ? createSegmentedLineDrawHook(
        series,
        {
          strokeWidth: theme.line.strokeWidth,
          areaFill: Boolean(fill && theme.area.show),
          fillOpacity,
          pointRadius: defaultPointRadius,
          curve,
        },
        theme,
      )
    : undefined;
  const variablePointDraw =
    useCustomLineDraw && !useSegmentedFills
      ? createVariablePointDrawHook(series, defaultPointRadius, theme)
      : undefined;

  const useDualAxis = shouldStackSeries(stacked, series.length)
    ? false
    : shouldUseDualAxis(series, dualAxis);
  const showLegend = useNativeLegend && series.length > 1;
  const topPad = showLegend && !compact ? 28 : compact ? 4 : 8;
  const annotateY =
    thresholdBands.length > 0 || referenceLines.length > 0;

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
      y: annotateY
        ? {
            range: (_u, min, max) =>
              expandYRange(min, max, thresholdBands, referenceLines),
          }
        : { auto: true },
      ...(useDualAxis
        ? {
            y2: annotateY
              ? {
                  range: (_u, min, max) =>
                    expandYRange(min, max, thresholdBands, referenceLines),
                }
              : { auto: true },
          }
        : {}),
    },
    axes: showAxes
      ? [
          {
            stroke: chrome.axis,
            grid: theme.grid.vertical
              ? { stroke: gridStroke, width: gridWidth }
              : { show: false },
            ticks: { show: false },
            values: (_u, ticks) =>
              ticks.map((tick) => categories[tick] ?? ""),
            size: compact ? 0 : 18,
            font: "11px ui-sans-serif, system-ui, -apple-system, sans-serif",
          },
          {
            scale: "y",
            side: 3,
            stroke: chrome.axis,
            grid: theme.grid.horizontal ? compactYGrid : { show: false },
            splits: compactSplits,
            ticks: { show: false },
            size: compact ? 0 : 32,
            font: theme.values.monospace
              ? "11px ui-monospace, SFMono-Regular, Menlo, monospace"
              : "11px ui-sans-serif, system-ui, -apple-system, sans-serif",
          },
          ...(useDualAxis
            ? [
                {
                  scale: "y2",
                  side: 1,
                  stroke: chrome.axis,
                  grid: { show: false },
                  ticks: { show: false },
                  size: 32,
                  font: theme.values.monospace
                    ? "11px ui-monospace, SFMono-Regular, Menlo, monospace"
                    : "11px ui-sans-serif, system-ui, -apple-system, sans-serif",
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
        const color = item.color ?? resolveSeriesColor(item.tone, index, theme);
        const stackSeries = shouldStackSeries(stacked, series.length);
        const hasPointFills =
          useSegmentedFills && Boolean(item.fills && item.fills.length > 0);
        const hideNativeSeries = hasPointFills;
        return {
          label: item.name,
          scale: useDualAxis && index > 0 ? "y2" : "y",
          stroke: hideNativeSeries ? "transparent" : color,
          width: theme.line.strokeWidth,
          paths: hideNativeSeries
            ? segmentedSeriesPaths()
            : smoothPaths,
          fill:
            !hideNativeSeries && fill && theme.area.show
              ? (u: uPlot) => {
                  const top = u.bbox.top;
                  const bottom = u.bbox.top + u.bbox.height;
                  return createAreaGradient(
                    u.ctx,
                    top,
                    bottom,
                    color,
                    fillOpacity,
                  );
                }
              : undefined,
          stack: stackSeries ? STACK_GROUP : undefined,
          points: { show: false },
        };
      }),
    ],
    hooks:
      thresholdBands.length > 0 ||
      referenceLines.length > 0 ||
      segmentedDraw ||
      variablePointDraw
        ? {
            draw: [
              createAnnotationDrawHook({
                bands: thresholdBands,
                referenceLines,
                onDraw:
                  segmentedDraw || variablePointDraw
                    ? (u) => {
                        segmentedDraw?.(u);
                        variablePointDraw?.(u);
                      }
                    : undefined,
              }) as (u: uPlot) => void,
            ],
          }
        : undefined,
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
    props.thresholdBands,
    props.referenceLines,
    props.curve,
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
