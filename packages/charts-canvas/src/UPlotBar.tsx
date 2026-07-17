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
import type { UPlotBarProps } from "./types";
import { applySyncedCursor } from "./plotCursor";
import {
  createAnnotationDrawHook,
  expandYRange,
} from "./plotAnnotations";
import { shouldStackSeries, STACK_GROUP } from "./stack";
import { resolveSeriesColor } from "./seriesColor";

type BarLayout = {
  left: number;
  top: number;
  width: number;
  height: number;
  value: number;
};

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
  barLayoutsRef,
  stacked = false,
  showCursor = false,
  useNativeLegend = true,
}: UPlotBarProps & {
  barLayoutsRef: React.MutableRefObject<BarLayout[]>;
}): uPlot.Options {
  const gridStroke = withAlpha(GRID_COLOR, theme.grid.opacity);
  const gapPx = Math.max(2, Math.round(theme.bar.gap * 24));
  const stackSeries = shouldStackSeries(stacked, series.length);
  const showBarValues = showValues && !stackSeries;

  return {
    width,
    height,
    class: "axicharts-uplot",
    padding: [8, 10, 8, 10],
    cursor: {
      show: showCursor,
      x: true,
      y: false,
      points: { show: false },
    },
    legend: { show: useNativeLegend && series.length > 1 },
    scales: {
      x: { time: false },
      y: {
        range: (_u, dataMin, dataMax) => {
          const [expandedMin, expandedMax] = expandYRange(
            dataMin,
            dataMax,
            thresholdBands,
            referenceLines,
          );
          const top = Math.max(expandedMax, dataMax) * 1.12;
          const bottom =
            thresholdBands.length > 0
              ? Math.min(0, expandedMin)
              : 0;
          return [bottom, top];
        },
      },
    },
    axes: showAxes
      ? [
          {
            stroke: AXIS_COLOR,
            grid: theme.grid.vertical
              ? { stroke: gridStroke, width: theme.grid.strokeWidth }
              : { show: false },
            ticks: { show: false },
            values: (_u, ticks) =>
              ticks.map((tick) => categories[tick] ?? ""),
            size: 18,
            font: "11px ui-sans-serif, system-ui, sans-serif",
            gap: 4,
          },
          {
            stroke: AXIS_COLOR,
            grid: theme.grid.horizontal
              ? { stroke: gridStroke, width: theme.grid.strokeWidth }
              : { show: false },
            ticks: { show: false },
            size: 32,
            font: theme.values.monospace
              ? "11px ui-monospace, SFMono-Regular, Menlo, monospace"
              : "11px ui-sans-serif, system-ui, sans-serif",
            gap: 4,
          },
        ]
      : [],
    series: [
      {},
      ...series.map((item, index) => {
        const color = item.color ?? resolveSeriesColor(item.tone, index);
        return {
          label: item.name,
          stroke: color,
          fill: color,
          width: 0,
          stack: stackSeries ? STACK_GROUP : undefined,
          paths: uPlot.paths.bars!({
            gap: gapPx,
            size: [0.6, 100],
            each: (u, seriesIdx, idx, left, top, barWidth, barHeight) => {
              if (!showBarValues) return;
              if (seriesIdx === 1 && idx === 0) barLayoutsRef.current = [];
              const value =
                (u.data[seriesIdx] as number[] | undefined)?.[idx] ?? 0;
              barLayoutsRef.current.push({
                left,
                top,
                width: barWidth,
                height: barHeight,
                value,
              });
            },
          }),
          points: { show: false },
        };
      }),
    ],
    hooks: {
      draw: [
        createAnnotationDrawHook({
          bands: thresholdBands,
          referenceLines,
          onDraw: (u) => {
            if (!showBarValues) return;
            const ctx = u.ctx;
            const layouts = barLayoutsRef.current;
            ctx.save();
            ctx.fillStyle = AXIS_COLOR;
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
