"use client";

import { useEffect, useMemo, useRef } from "react";
import type { ReactElement } from "react";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";
import {
  CANVAS_BG,
  chromeGridStroke,
  resolveChromeColors,
} from "./colors";
import type { UPlotBarProps, BarOrientation } from "./types";
import { applySyncedCursor } from "./plotCursor";
import {
  createAnnotationDrawHook,
  expandYRange,
} from "./plotAnnotations";
import { resolveAnnotationPlotProps } from "./annotations";
import { shouldStackSeries, STACK_GROUP } from "./stack";
import { resolveSeriesColor } from "./seriesColor";
import { axisCategoryValues } from "./axisCategoryLabel";
import {
  categoryAxisSize,
  categoryAxisSizeForLabels,
  categoryChartPadding,
  categoryXScale,
  horizontalBarChartPadding,
  horizontalValueAxisMax,
  ordinalBarGapPx,
  ordinalBarSize,
} from "./categoricalScale";
import {
  drawStackBarTotals,
  recordStackBarTotal,
  type StackBarTotal,
} from "./stackBarTotals";
import type { PlotSeries } from "./types";

type BarLayout = {
  left: number;
  top: number;
  width: number;
  height: number;
  value: number;
  fill: string;
  categoryIndex: number;
  seriesIndex: number;
};

function hasCustomFills(series: PlotSeries[]): boolean {
  return series.some((item) => item.fills && item.fills.length > 0);
}

function hasCustomSizes(series: PlotSeries[]): boolean {
  return series.some((item) => item.sizes && item.sizes.length > 0);
}

function drawRoundedBar(
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
  width: number,
  height: number,
  radius: number,
  fill: string,
  orientation: BarOrientation = "vertical",
  roundCap = true,
): void {
  if (height <= 0 || width <= 0) return;

  ctx.fillStyle = fill;
  if (!roundCap || radius <= 0) {
    ctx.fillRect(left, top, width, height);
    return;
  }

  const r = Math.min(radius, width / 2, height / 2);

  if (orientation === "horizontal") {
    const right = left + width;
    const bottom = top + height;
    ctx.beginPath();
    ctx.moveTo(left, top);
    ctx.lineTo(right - r, top);
    ctx.quadraticCurveTo(right, top, right, top + r);
    ctx.lineTo(right, bottom - r);
    ctx.quadraticCurveTo(right, bottom, right - r, bottom);
    ctx.lineTo(left, bottom);
    ctx.closePath();
    ctx.fill();
    return;
  }

  const bottom = top + height;
  const right = left + width;

  ctx.beginPath();
  ctx.moveTo(left, bottom);
  ctx.lineTo(left, top + r);
  ctx.quadraticCurveTo(left, top, left + r, top);
  ctx.lineTo(right - r, top);
  ctx.quadraticCurveTo(right, top, right, top + r);
  ctx.lineTo(right, bottom);
  ctx.closePath();
  ctx.fill();
}

/** Top-of-stack (vertical) or trailing-edge (horizontal) segment per category. */
function stackCapKeys(
  layouts: BarLayout[],
  orientation: BarOrientation,
): Set<string> {
  const best = new Map<number, BarLayout>();
  for (const layout of layouts) {
    if (layout.height <= 0 || layout.width <= 0) continue;
    const prev = best.get(layout.categoryIndex);
    if (!prev) {
      best.set(layout.categoryIndex, layout);
      continue;
    }
    const prefer =
      orientation === "horizontal"
        ? layout.left + layout.width >= prev.left + prev.width
        : layout.top <= prev.top;
    if (prefer) best.set(layout.categoryIndex, layout);
  }
  return new Set(
    [...best.values()].map(
      (layout) => `${layout.categoryIndex}:${layout.seriesIndex}`,
    ),
  );
}

function formatValue(value: number, suffix = ""): string {
  const rounded =
    Math.abs(value) >= 100 ? value.toFixed(0) : value.toFixed(1);
  return `${rounded}${suffix}`;
}

export function buildBarOptions({
  width,
  height,
  categories,
  series,
  theme,
  showAxes = true,
  showValues = false,
  valueSuffix = "",
  referenceLines = [],
  thresholdBands = [],
  annotations = [],
  verticalLines: verticalLinesProp = [],
  plotLabels: plotLabelsProp = [],
  plotMarkers: plotMarkersProp = [],
  barLayoutsRef,
  stackTotalsRef,
  stacked = false,
  showCursor = false,
  useNativeLegend = true,
  orientation = "vertical",
}: UPlotBarProps & {
  barLayoutsRef: React.MutableRefObject<BarLayout[]>;
  stackTotalsRef: React.MutableRefObject<Map<number, StackBarTotal>>;
}): uPlot.Options {
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
  const stackSeries = shouldStackSeries(stacked, series.length);
  const barSeriesCount = stackSeries ? 1 : series.length;
  const showStackTotals = showValues && stackSeries;
  const showBarValues = showValues && !stackSeries;
  const customFills = hasCustomFills(series) && !stackSeries;
  const customSizes = hasCustomSizes(series) && !stackSeries;
  const customMarks = customFills || customSizes;
  const paintRounded = theme.bar.radius > 0;
  const paintCustomBars = paintRounded || customMarks;
  const showLegend = useNativeLegend && series.length > 1;
  const topPad =
    (showBarValues || showStackTotals) && !compact ? 18 : compact ? 4 : 8;
  const horizontal = orientation === "horizontal";
  const leftAxisSize = categoryAxisSizeForLabels(categories, compact);
  const valueRange = (
    _u: uPlot,
    dataMin: number,
    dataMax: number,
  ): [number, number] => {
    const [expandedMin, expandedMax] = expandYRange(
      dataMin,
      dataMax,
      horizontal ? [] : thresholdBandsResolved,
      horizontal ? [] : referenceLinesResolved,
      horizontal ? [] : extraY,
    );
    const peak = Math.max(expandedMax, dataMax);
    const top = horizontal
      ? horizontalValueAxisMax(peak)
      : stackSeries && categories.length <= 8
        ? peak * 1.06
        : peak * 1.12;
    const bottom =
      !horizontal && thresholdBandsResolved.length > 0
        ? Math.min(0, expandedMin)
        : 0;
    return [bottom, top];
  };

  const barSeriesPaths = series.map((item, index) => {
    const color = item.color ?? resolveSeriesColor(item.tone, index, theme);
    const paintCustom =
      paintCustomBars ||
      (customMarks && Boolean(item.fills?.length || item.sizes?.length));
    return {
      label: item.name,
      stroke: paintCustom ? "transparent" : color,
      fill: paintCustom ? "transparent" : color,
      width: 0,
      stack: stackSeries ? STACK_GROUP : undefined,
      paths: uPlot.paths.bars!({
        gap: gapPx,
        size: ordinalBarSize(categories.length, barSeriesCount),
        each: (u, seriesIdx, idx, left, top, barWidth, barHeight) => {
          const seriesIndex = seriesIdx - 1;
          const value =
            (u.data[seriesIdx] as number[] | undefined)?.[idx] ?? 0;
          const fill =
            item.fills?.[idx] ??
            item.color ??
            resolveSeriesColor(item.tone, seriesIndex, theme);
          const sizeMul = item.sizes?.[idx] ?? 1;
          const barW = barWidth * sizeMul;
          const barH = barHeight * sizeMul;
          const adjustedLeft = horizontal
            ? left
            : left + (barWidth - barW) / 2;
          const adjustedTop = horizontal
            ? top + (barHeight - barH) / 2
            : top;
          const adjustedWidth = barW;
          const adjustedHeight = horizontal ? barH : barHeight;

          if (seriesIdx === 1 && idx === 0) {
            barLayoutsRef.current = [];
            stackTotalsRef.current.clear();
          }

          if (showStackTotals) {
            recordStackBarTotal(
              stackTotalsRef.current,
              idx,
              adjustedLeft,
              adjustedTop,
              adjustedWidth,
              adjustedHeight,
              value,
              orientation,
            );
          }

          if (paintCustom || showBarValues) {
            barLayoutsRef.current.push({
              left: adjustedLeft,
              top: adjustedTop,
              width: adjustedWidth,
              height: adjustedHeight,
              value,
              fill,
              categoryIndex: idx,
              seriesIndex,
            });
          }
        },
      }),
      points: { show: false },
    };
  });

  const drawBarHook = createAnnotationDrawHook({
    bands: horizontal ? [] : thresholdBandsResolved,
    referenceLines: horizontal ? [] : referenceLinesResolved,
    verticalLines: horizontal ? [] : verticalLines,
    labels: horizontal ? [] : plotLabels,
    markers: horizontal ? [] : plotMarkers,
    categories,
    onDraw: (u) => {
      const ctx = u.ctx;
      const layouts = barLayoutsRef.current;

      if (paintCustomBars) {
        const radius = theme.bar.radius;
        const caps = stackSeries
          ? stackCapKeys(layouts, orientation)
          : null;
        for (const layout of layouts) {
          const roundCap =
            !stackSeries ||
            caps!.has(`${layout.categoryIndex}:${layout.seriesIndex}`);
          drawRoundedBar(
            ctx,
            layout.left,
            layout.top,
            layout.width,
            layout.height,
            radius,
            layout.fill,
            orientation,
            roundCap,
          );
        }
      }

      if (!showBarValues && !showStackTotals) return;

      if (showBarValues) {
        ctx.save();
        ctx.fillStyle = chrome.axis;
        ctx.font = "10px ui-sans-serif, system-ui, sans-serif";

        if (horizontal) {
          ctx.textAlign = "left";
          ctx.textBaseline = "middle";
          for (const layout of layouts) {
            const label = formatValue(layout.value, valueSuffix);
            const x = layout.left + layout.width + 4;
            const y = layout.top + layout.height / 2;
            ctx.fillText(label, x, y);
          }
        } else {
          ctx.textAlign = "center";
          ctx.textBaseline = "bottom";
          for (const layout of layouts) {
            const label = formatValue(layout.value, valueSuffix);
            const x = layout.left + layout.width / 2;
            const y = layout.top - 4;
            ctx.fillText(label, x, y);
          }
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
          orientation,
        );
      }
    },
  }) as (u: uPlot) => void;

  if (horizontal) {
    return {
      width,
      height,
      class: "axicharts-uplot",
      padding: compact
        ? [topPad, 6, 4, 6]
        : horizontalBarChartPadding(
            categories.length,
            leftAxisSize,
            topPad,
            showBarValues || showStackTotals,
          ),
      cursor: {
        show: showCursor,
        x: false,
        y: true,
        points: { show: false },
      },
      legend: { show: showLegend },
      scales: {
        x: {
          time: false,
          range: categoryXScale(categories.length).range,
          ori: 1,
          dir: -1,
        },
        y: {
          ori: 0,
          dir: 1,
          range: valueRange,
        },
      },
      axes: showAxes
        ? ([
            {
              scale: "x",
              side: 3,
              ori: 1,
              dir: -1,
              stroke: chrome.axis,
              grid: { show: false },
              ticks: { show: true, stroke: chrome.axis, size: 4 },
              values: axisCategoryValues(categories),
              size: leftAxisSize,
              font: "11px ui-sans-serif, system-ui, -apple-system, sans-serif",
              gap: 4,
            },
            {
              scale: "y",
              side: 2,
              ori: 0,
              dir: 1,
              stroke: chrome.axis,
              grid: theme.grid.horizontal
                ? { stroke: gridStroke, width: theme.grid.strokeWidth }
                : { show: false },
              ticks: { show: true, stroke: chrome.axis, size: 4 },
              size: compact ? 0 : 32,
              font: theme.values.monospace
                ? "11px ui-monospace, SFMono-Regular, Menlo, monospace"
                : "11px ui-sans-serif, system-ui, -apple-system, sans-serif",
              gap: 4,
            },
          ] as unknown as uPlot.Axis[])
        : [],
      series: [{}, ...barSeriesPaths],
      hooks: {
        draw: [drawBarHook],
      },
    };
  }

  return {
    width,
    height,
    class: "axicharts-uplot",
    padding: compact
      ? [topPad, 6, 4, 6]
      : categoryChartPadding(width, categories.length, false, topPad),
    cursor: {
      show: showCursor,
      x: true,
      y: false,
      points: { show: false },
    },
    legend: { show: useNativeLegend && series.length > 1 },
    scales: {
      x: compact ? { time: false } : categoryXScale(categories.length),
      y: {
        range: valueRange,
      },
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
        ]
      : [],
    series: [{}, ...barSeriesPaths],
    hooks: {
      draw: [drawBarHook],
    },
  };
}

function buildData(categories: string[], series: UPlotBarProps["series"]) {
  const x = categories.map((_, index) => index);
  return [x, ...series.map((item) => item.data)] as uPlot.AlignedData;
}

export function UPlotBar(props: UPlotBarProps): ReactElement {
  const {
    width,
    height,
    categories,
    series,
    theme,
    showAxes,
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
  const barLayoutsRef = useRef<BarLayout[]>([]);
  const stackTotalsRef = useRef<Map<number, StackBarTotal>>(new Map());
  const onCursorRef = useRef(onCursor);
  const onSyncIndexRef = useRef(onSyncIndex);
  const applyingSyncRef = useRef(false);
  onCursorRef.current = onCursor;
  onSyncIndexRef.current = onSyncIndex;

  const options = useMemo(() => {
    const base = buildBarOptions({ ...props, barLayoutsRef, stackTotalsRef });
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
    props.showValues,
    props.valueSuffix,
    props.referenceLines,
    props.thresholdBands,
    props.annotations,
    props.verticalLines,
    props.plotLabels,
    props.plotMarkers,
    props.orientation,
    showAxes,
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

    barLayoutsRef.current = [];
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
        overflow: "visible",
      }}
    />
  );
}
