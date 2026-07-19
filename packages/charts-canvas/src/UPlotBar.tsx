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
import type { UPlotBarProps } from "./types";
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
  categoryChartPadding,
  categoryXScale,
  ordinalBarGapPx,
  ordinalBarSize,
} from "./categoricalScale";
import type { PlotSeries } from "./types";

type BarLayout = {
  left: number;
  top: number;
  width: number;
  height: number;
  value: number;
  fill: string;
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
): void {
  if (height <= 0 || width <= 0) return;

  const bottom = top + height;
  const right = left + width;
  const r = Math.min(radius, width / 2, height);

  ctx.beginPath();
  ctx.moveTo(left, bottom);
  ctx.lineTo(left, top + r);
  ctx.quadraticCurveTo(left, top, left + r, top);
  ctx.lineTo(right - r, top);
  ctx.quadraticCurveTo(right, top, right, top + r);
  ctx.lineTo(right, bottom);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function formatValue(value: number, suffix = ""): string {
  const rounded =
    Math.abs(value) >= 100 ? value.toFixed(0) : value.toFixed(1);
  return `${rounded}${suffix}`;
}

function buildOptions({
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
  stacked = false,
  showCursor = false,
  useNativeLegend = true,
}: UPlotBarProps & {
  barLayoutsRef: React.MutableRefObject<BarLayout[]>;
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
  const gridStroke = chromeGridStroke(theme);
  const gapPx = ordinalBarGapPx(categories.length, theme.bar.gap);
  const stackSeries = shouldStackSeries(stacked, series.length);
  const showBarValues = showValues && !stackSeries;
  const customFills = hasCustomFills(series) && !stackSeries;
  const customSizes = hasCustomSizes(series) && !stackSeries;
  const customMarks = customFills || customSizes;

  return {
    width,
    height,
    class: "axicharts-uplot",
    padding: categoryChartPadding(width, categories.length),
    cursor: {
      show: showCursor,
      x: true,
      y: false,
      points: { show: false },
    },
    legend: { show: useNativeLegend && series.length > 1 },
    scales: {
      x: categoryXScale(categories.length),
      y: {
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
            thresholdBandsResolved.length > 0
              ? Math.min(0, expandedMin)
              : 0;
          return [bottom, top];
        },
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
            values: axisCategoryValues(categories, width),
            size: categoryAxisSize(),
            font: "11px ui-sans-serif, system-ui, -apple-system, sans-serif",
            gap: 8,
          },
          {
            stroke: chrome.axis,
            grid: theme.grid.horizontal
              ? { stroke: gridStroke, width: theme.grid.strokeWidth }
              : { show: false },
            ticks: { show: false },
            size: 32,
            font: theme.values.monospace
              ? "11px ui-monospace, SFMono-Regular, Menlo, monospace"
              : "11px ui-sans-serif, system-ui, -apple-system, sans-serif",
            gap: 4,
          },
        ]
      : [],
    series: [
      {},
      ...series.map((item, index) => {
        const color = item.color ?? resolveSeriesColor(item.tone, index, theme);
        const paintCustom =
          customMarks &&
          Boolean(item.fills?.length || item.sizes?.length);
        return {
          label: item.name,
          stroke: paintCustom ? "transparent" : color,
          fill: paintCustom ? "transparent" : color,
          width: 0,
          stack: stackSeries ? STACK_GROUP : undefined,
          paths: uPlot.paths.bars!({
            gap: gapPx,
            size: ordinalBarSize(categories.length, series.length),
            each: (u, seriesIdx, idx, left, top, barWidth, barHeight) => {
              const seriesIndex = seriesIdx - 1;
              const value =
                (u.data[seriesIdx] as number[] | undefined)?.[idx] ?? 0;
              const fill =
                item.fills?.[idx] ??
                item.color ??
                resolveSeriesColor(item.tone, seriesIndex, theme);
              const sizeMul = item.sizes?.[idx] ?? 1;
              const width = barWidth * sizeMul;
              const adjustedLeft = left + (barWidth - width) / 2;

              if (seriesIdx === 1 && idx === 0) {
                barLayoutsRef.current = [];
              }

              if (paintCustom || showBarValues) {
                barLayoutsRef.current.push({
                  left: adjustedLeft,
                  top,
                  width,
                  height: barHeight,
                  value,
                  fill,
                });
              }
            },
          }),
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
          onDraw: (u) => {
            const ctx = u.ctx;
            const layouts = barLayoutsRef.current;

            if (customMarks) {
              const radius = theme.bar.radius;
              for (const layout of layouts) {
                drawRoundedBar(
                  ctx,
                  layout.left,
                  layout.top,
                  layout.width,
                  layout.height,
                  radius,
                  layout.fill,
                );
              }
            }

            if (!showBarValues) return;

            ctx.save();
            ctx.fillStyle = chrome.axis;
            ctx.font = "10px ui-sans-serif, system-ui, sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "bottom";

            for (const layout of layouts) {
              const label = formatValue(layout.value, valueSuffix);
              const x = layout.left + layout.width / 2;
              const y = layout.top - 4;
              ctx.fillText(label, x, y);
            }

            ctx.restore();
          },
        }) as (u: uPlot) => void,
      ],
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
  const onCursorRef = useRef(onCursor);
  const onSyncIndexRef = useRef(onSyncIndex);
  const applyingSyncRef = useRef(false);
  onCursorRef.current = onCursor;
  onSyncIndexRef.current = onSyncIndex;

  const options = useMemo(() => {
    const base = buildOptions({ ...props, barLayoutsRef });
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
        overflow: "hidden",
      }}
    />
  );
}
