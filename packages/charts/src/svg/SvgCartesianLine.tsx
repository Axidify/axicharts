"use client";

import type { ReactElement } from "react";
import type { ChartTheme } from "@axicharts/charts-theme";
import {
  resolveSeriesColor,
  type PlotSeries,
} from "@axicharts/charts-canvas";
import { chromeGridStroke, resolveChromeColors } from "@axicharts/charts-canvas";
import {
  areaPath,
  computeValueExtents,
  linePath,
  plotRect,
  xAt,
  yAt,
} from "./scales";

export type SvgCartesianLineProps = {
  width: number;
  height: number;
  categories: string[];
  series: PlotSeries[];
  theme: ChartTheme;
  fill?: boolean;
  showAxes?: boolean;
  stacked?: boolean;
};

export function SvgCartesianLine({
  width,
  height,
  categories,
  series,
  theme,
  fill = false,
  showAxes = true,
  stacked = false,
}: SvgCartesianLineProps): ReactElement {
  const plot = plotRect(width, height);
  const { min, max } = computeValueExtents(series, stacked);
  const chrome = resolveChromeColors(theme);
  const gridStroke = chromeGridStroke(theme, height < 72);
  const tickCount = Math.min(4, categories.length);

  return (
    <svg
      data-engine="svg"
      width={width}
      height={height}
      role="img"
      aria-label={series.map((item) => item.name).join(", ")}
    >
      {[0.25, 0.5, 0.75].map((ratio) => {
        const y = plot.y + plot.height * ratio;
        return (
          <line
            key={ratio}
            x1={plot.x}
            x2={plot.x + plot.width}
            y1={y}
            y2={y}
            stroke={gridStroke}
            strokeWidth={1}
          />
        );
      })}
      {series.map((item, seriesIndex) => {
        const color =
          item.color ?? resolveSeriesColor(item.tone, seriesIndex);
        const path = fill
          ? areaPath(item.data, min, max, plot)
          : linePath(item.data, min, max, plot);
        return (
          <path
            key={item.name}
            d={path}
            fill={fill ? color : "none"}
            fillOpacity={fill ? theme.area.fillOpacity : undefined}
            stroke={color}
            strokeWidth={theme.line.strokeWidth}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        );
      })}
      {showAxes ? (
        <>
          <line
            x1={plot.x}
            x2={plot.x + plot.width}
            y1={plot.y + plot.height}
            y2={plot.y + plot.height}
            stroke={chrome.axis}
            strokeWidth={1}
          />
          <line
            x1={plot.x}
            x2={plot.x}
            y1={plot.y}
            y2={plot.y + plot.height}
            stroke={chrome.axis}
            strokeWidth={1}
          />
          {Array.from({ length: tickCount }, (_, index) => {
            const categoryIndex = Math.round(
              (index / Math.max(tickCount - 1, 1)) * (categories.length - 1),
            );
            const x = xAt(categoryIndex, categories.length, plot);
            return (
              <text
                key={categoryIndex}
                x={x}
                y={plot.y + plot.height + 14}
                textAnchor="middle"
                fill={chrome.axis}
                fontSize={10}
              >
                {categories[categoryIndex]}
              </text>
            );
          })}
          {[0, 0.5, 1].map((ratio) => {
            const value = min + (max - min) * (1 - ratio);
            const y = yAt(value, min, max, plot);
            return (
              <text
                key={ratio}
                x={plot.x - 6}
                y={y + 3}
                textAnchor="end"
                fill={chrome.axis}
                fontSize={10}
              >
                {Math.round(value)}
              </text>
            );
          })}
        </>
      ) : null}
    </svg>
  );
}
