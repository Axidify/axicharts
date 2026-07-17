"use client";

import { useEffect, useMemo, useRef } from "react";
import type { ReactElement } from "react";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";
import {
  AXIS_COLOR,
  CANVAS_BG,
  GRID_COLOR,
  SERIES_COLORS,
  withAlpha,
} from "./colors";
import type { UPlotLineProps } from "./types";

function buildOptions({
  width,
  height,
  categories,
  series,
  theme,
  fill,
  showAxes = true,
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

  return {
    width,
    height,
    class: "axicharts-uplot",
    padding: compact ? [4, 6, 4, 6] : [8, 10, 8, 10],
    cursor: { show: false },
    legend: { show: series.length > 1 },
    scales: {
      x: { time: false },
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
            stroke: AXIS_COLOR,
            grid: theme.grid.horizontal ? compactYGrid : { show: false },
            splits: compactSplits,
            ticks: { show: false },
            size: compact ? 0 : 32,
            font: theme.values.monospace
              ? "11px ui-monospace, SFMono-Regular, Menlo, monospace"
              : "11px ui-sans-serif, system-ui, sans-serif",
          },
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
      ...series.map((item) => {
        const color = SERIES_COLORS[item.tone ?? "default"];
        return {
          label: item.name,
          stroke: color,
          width: theme.line.strokeWidth,
          fill: fill && theme.area.show ? withAlpha(color, fillOpacity) : undefined,
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
  const { width, height, categories, series, theme, fill, showAxes } = props;
  const rootRef = useRef<HTMLDivElement>(null);
  const plotRef = useRef<uPlot | null>(null);

  const options = useMemo(
    () => buildOptions(props),
    [width, height, categories, series, theme, fill, showAxes],
  );

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
