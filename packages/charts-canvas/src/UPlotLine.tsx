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
  const gridStroke = withAlpha(GRID_COLOR, theme.grid.opacity);

  return {
    width,
    height,
    class: "axicharts-uplot",
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
              ? { stroke: gridStroke, width: theme.grid.strokeWidth }
              : { show: false },
            ticks: { show: false },
            values: (_u, ticks) =>
              ticks.map((tick) => categories[tick] ?? ""),
            size: 18,
            font: "11px ui-sans-serif, system-ui, sans-serif",
          },
          {
            stroke: AXIS_COLOR,
            grid: theme.grid.horizontal
              ? { stroke: gridStroke, width: theme.grid.strokeWidth }
              : { show: false },
            ticks: { show: false },
            size: showAxes ? 32 : 0,
            font: theme.values.monospace
              ? "11px ui-monospace, SFMono-Regular, Menlo, monospace"
              : "11px ui-sans-serif, system-ui, sans-serif",
          },
        ]
      : [
          {
            show: false,
            grid: theme.grid.horizontal
              ? { stroke: gridStroke, width: theme.grid.strokeWidth }
              : { show: false },
          },
          {
            show: false,
            grid: theme.grid.horizontal
              ? { stroke: gridStroke, width: theme.grid.strokeWidth }
              : { show: false },
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
          fill: fill && theme.area.show ? withAlpha(color, theme.area.fillOpacity) : undefined,
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
