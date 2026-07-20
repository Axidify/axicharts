"use client";

import { useEffect, useMemo, useRef } from "react";
import type { ReactElement, MutableRefObject } from "react";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";
import {
  CANVAS_BG,
  chromeGridStroke,
  createAreaGradient,
  resolveChromeColors,
} from "./colors";
import type { ComboSeries, UPlotComboProps } from "./types";
import { applySyncedCursor } from "./plotCursor";
import {
  createAnnotationDrawHook,
  expandYRange,
} from "./plotAnnotations";
import { resolveAnnotationPlotProps } from "./annotations";
import { resolveSeriesColor } from "./seriesColor";
import { lineSeriesPaths, resolveLineCurve } from "./linePaths";
import { axisCategoryValues } from "./axisCategoryLabel";
import {
  categoryAxisSize,
  categoryChartPadding,
  categoryXScale,
  ordinalBarGapPx,
  ordinalBarSize,
} from "./categoricalScale";
import {
  drawStackBarTotals,
  recordStackBarTotal,
  type StackBarTotal,
} from "./stackBarTotals";
import { shouldUseDualAxis } from "./dualAxis";
import { shouldStackSeries, STACK_GROUP } from "./stack";

type BarLayout = {
  left: number;
  top: number;
  width: number;
  height: number;
  value: number;
  fill: string;
};

function formatValue(value: number, suffix = ""): string {
  const rounded =
    Math.abs(value) >= 100 ? value.toFixed(0) : value.toFixed(1);
  return `${rounded}${suffix}`;
}

export function buildComboOptions(
  props: UPlotComboProps & {
    barLayoutsRef: MutableRefObject<BarLayout[]>;
    stackTotalsRef: MutableRefObject<Map<number, StackBarTotal>>;
  },
): uPlot.Options {
  const {
    width,
    height,
    categories,
    series,
    theme,
    curve: curveOverride,
    fill = false,
    showAxes = true,
    showValues = false,
    valueSuffix = "",
    dualAxis = "auto",
    stacked = false,
    referenceLines = [],
    thresholdBands = [],
    annotations = [],
    verticalLines: verticalLinesProp = [],
    plotLabels: plotLabelsProp = [],
    plotMarkers: plotMarkersProp = [],
    barLayoutsRef,
    stackTotalsRef,
    showCursor = false,
    useNativeLegend = true,
  } = props;

  const {
    thresholdBands: thresholdBandsResolved,
    referenceLines: referenceLinesResolved,
    verticalLines,
    labels: plotLabels,
    markers: plotMarkers,
    extraY,
  } = resolveAnnotationPlotProps({
    annotations,
    thresholdBands,
    referenceLines,
    verticalLines: verticalLinesProp,
    plotLabels: plotLabelsProp,
    plotMarkers: plotMarkersProp,
  });

  const chrome = resolveChromeColors(theme);
  const compact = height < 72;
  const gridStroke = chromeGridStroke(theme, compact);
  const gapPx = ordinalBarGapPx(categories.length, theme.bar.gap);
  const fillOpacity = theme.area.fillOpacity;
  const annotateY =
    thresholdBandsResolved.length > 0 ||
    referenceLinesResolved.length > 0 ||
    extraY.length > 0;
  const barCount = series.filter((item) => item.kind === "bar").length;
  const stackBars = shouldStackSeries(stacked, barCount);
  const showStackTotals = showValues && stackBars;
  const showBarValues = showValues && !stackBars;
  const useDualAxis = stackBars ? false : shouldUseDualAxis(series, dualAxis);
  const showLegend = useNativeLegend && series.length > 1;
  const topPad =
    (showBarValues || showStackTotals) && !compact ? 18 : compact ? 4 : 8;

  return {
    width,
    height,
    class: "axicharts-uplot",
    padding: compact
      ? [topPad, 6, 4, 6]
      : categoryChartPadding(width, categories.length, useDualAxis, topPad),
    cursor: {
      show: showCursor,
      x: true,
      y: false,
      points: { show: false },
    },
    legend: { show: useNativeLegend && series.length > 1 },
    scales: {
      x: compact ? { time: false } : categoryXScale(categories.length),
      y: useDualAxis
        ? annotateY
          ? {
              range: (_u, min, max) =>
                expandYRange(
                  min,
                  max,
                  thresholdBandsResolved,
                  referenceLinesResolved,
                  extraY,
                ),
            }
          : { auto: true }
        : {
            range: (_u, dataMin, dataMax) => {
              const [expandedMin, expandedMax] = expandYRange(
                dataMin,
                dataMax,
                thresholdBandsResolved,
                referenceLinesResolved,
                extraY,
              );
              const top = Math.max(expandedMax, dataMax) * 1.12;
              const bottom =
                thresholdBandsResolved.length > 0 ? Math.min(0, expandedMin) : 0;
              return [bottom, top];
            },
          },
      ...(useDualAxis
        ? {
            y2: annotateY
              ? {
                  range: (_u, min, max) =>
                    expandYRange(
                      min,
                      max,
                      thresholdBandsResolved,
                      referenceLinesResolved,
                      extraY,
                    ),
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
              ? { stroke: gridStroke, width: theme.grid.strokeWidth }
              : { show: false },
            ticks: { show: false },
            values: axisCategoryValues(categories, compact ? undefined : width),
            size: compact ? 0 : categoryAxisSize(),
            font: "11px ui-sans-serif, system-ui, -apple-system, sans-serif",
            gap: 8,
          },
          {
            stroke: chrome.axis,
            grid: theme.grid.horizontal
              ? { stroke: gridStroke, width: theme.grid.strokeWidth }
              : { show: false },
            ticks: { show: false },
            size: compact ? 0 : 32,
            font: theme.values.monospace
              ? "11px ui-monospace, SFMono-Regular, Menlo, monospace"
              : "11px ui-sans-serif, system-ui, -apple-system, sans-serif",
            gap: 4,
          },
          ...(useDualAxis
            ? [
                {
                  scale: "y2",
                  side: 1,
                  stroke: chrome.axis,
                  grid: { show: false },
                  ticks: { show: false },
                  size: compact ? 0 : 32,
                  font: theme.values.monospace
                    ? "11px ui-monospace, SFMono-Regular, Menlo, monospace"
                    : "11px ui-sans-serif, system-ui, -apple-system, sans-serif",
                  gap: 4,
                },
              ]
            : []),
        ]
      : [],
    series: [
      {},
      ...series.map((item, index) => {
        const color = item.color ?? resolveSeriesColor(item.tone, index, theme);
        const scale = useDualAxis && index > 0 ? "y2" : "y";
        const seriesCurve = resolveLineCurve(
          theme.line.curve,
          item.curve ?? curveOverride,
        );
        const seriesPaths = lineSeriesPaths(seriesCurve);
        const seriesFill = item.fill ?? fill;
        if (item.kind === "bar") {
          return {
            label: item.name,
            scale,
            stroke: color,
            fill: color,
            width: 0,
            stack: stackBars ? STACK_GROUP : undefined,
            paths: uPlot.paths.bars!({
              gap: gapPx,
              size: ordinalBarSize(categories.length, barCount),
              each: (u, seriesIdx, idx, left, top, barWidth, barHeight) => {
                const value =
                  (u.data[seriesIdx] as number[] | undefined)?.[idx] ?? 0;
                if (seriesIdx === 1 && idx === 0) {
                  barLayoutsRef.current = [];
                  stackTotalsRef.current.clear();
                }
                if (showStackTotals) {
                  recordStackBarTotal(
                    stackTotalsRef.current,
                    idx,
                    left,
                    top,
                    barWidth,
                    barHeight,
                    value,
                  );
                }
                if (showBarValues) {
                  barLayoutsRef.current.push({
                    left,
                    top,
                    width: barWidth,
                    height: barHeight,
                    value,
                    fill: color,
                  });
                }
              },
            }),
            points: { show: false },
          };
        }

        return {
          label: item.name,
          scale,
          stroke: color,
          width: theme.line.strokeWidth,
          paths: seriesPaths,
          fill:
            seriesFill && theme.area.show
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
          points: { show: false },
        };
      }),
    ],
    hooks: {
      draw: [
        createAnnotationDrawHook({
          bands: thresholdBandsResolved,
          referenceLines: referenceLinesResolved,
          verticalLines,
          labels: plotLabels,
          markers: plotMarkers,
          categories,
          onDraw: showBarValues || showStackTotals
            ? (u) => {
                const ctx = u.ctx;
                if (showBarValues) {
                  ctx.save();
                  ctx.fillStyle = chrome.axis;
                  ctx.font = theme.values.monospace
                    ? "10px ui-monospace, SFMono-Regular, Menlo, monospace"
                    : "10px ui-sans-serif, system-ui, -apple-system, sans-serif";
                  ctx.textAlign = "center";
                  ctx.textBaseline = "bottom";
                  for (const layout of barLayoutsRef.current) {
                    ctx.fillText(
                      formatValue(layout.value, valueSuffix),
                      layout.left + layout.width / 2,
                      layout.top - 4,
                    );
                  }
                  ctx.restore();
                }
                if (showStackTotals) {
                  drawStackBarTotals(
                    ctx,
                    stackTotalsRef.current,
                    valueSuffix,
                    chrome.axis,
                    formatValue,
                  );
                }
              }
            : undefined,
        }) as (u: uPlot) => void,
      ],
    },
  };
}

function buildData(categories: string[], series: ComboSeries[]) {
  const x = categories.map((_, index) => index);
  return [x, ...series.map((item) => item.data)] as uPlot.AlignedData;
}

export function UPlotCombo(props: UPlotComboProps): ReactElement {
  const {
    width,
    height,
    categories,
    series,
    theme,
    showAxes,
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
  const barLayoutsRef = useRef<BarLayout[]>([]);
  const stackTotalsRef = useRef<Map<number, StackBarTotal>>(new Map());
  const onCursorRef = useRef(onCursor);
  const onSyncIndexRef = useRef(onSyncIndex);
  const applyingSyncRef = useRef(false);
  onCursorRef.current = onCursor;
  onSyncIndexRef.current = onSyncIndex;

  const options = useMemo(() => {
    const base = buildComboOptions({ ...props, barLayoutsRef, stackTotalsRef });
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
              onSyncIndexRef.current?.(idx == null || idx < 0 ? null : idx);
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
    props.fill,
    props.curve,
    props.showValues,
    props.valueSuffix,
    props.referenceLines,
    props.thresholdBands,
    props.annotations,
    props.verticalLines,
    props.plotLabels,
    props.plotMarkers,
    props.dualAxis,
    props.stacked,
    showAxes,
    showCursor,
    useNativeLegend,
    onCursor,
    onSyncIndex,
    props,
  ]);

  const data = useMemo(
    () => buildData(categories, series),
    [categories, series],
  );

  useEffect(() => {
    if (!rootRef.current || width < 1 || height < 1) return;

    barLayoutsRef.current = [];
    plotRef.current?.destroy();
    plotRef.current = new uPlot(options, data, rootRef.current);

    return () => {
      plotRef.current?.destroy();
      plotRef.current = null;
    };
  }, [options, data, width, height]);

  useEffect(() => {
    plotRef.current?.setData(data);
  }, [data]);

  useEffect(() => {
    plotRef.current?.setSize({ width, height });
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
        overflow: "visible",
      }}
    />
  );
}
