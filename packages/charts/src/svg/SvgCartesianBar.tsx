"use client";

import type { ReactElement } from "react";
import type { ChartTheme } from "@axicharts/charts-theme";
import {
  resolveSeriesColor,
  type PlotSeries,
} from "@axicharts/charts-canvas";
import { chromeGridStroke, resolveChromeColors } from "@axicharts/charts-canvas";
import {
  computeValueExtents,
  plotRect,
  xAt,
  yAt,
} from "./scales";

export type SvgCartesianBarProps = {
  width: number;
  height: number;
  categories: string[];
  series: PlotSeries[];
  theme: ChartTheme;
  showAxes?: boolean;
  stacked?: boolean;
};

export function SvgCartesianBar({
  width,
  height,
  categories,
  series,
  theme,
  showAxes = true,
  stacked = false,
}: SvgCartesianBarProps): ReactElement {
  const plot = plotRect(width, height);
  const { min, max } = computeValueExtents(series, stacked);
  const chrome = resolveChromeColors(theme);
  const gridStroke = chromeGridStroke(theme, height < 72);
  const groupWidth = plot.width / Math.max(categories.length, 1);
  const barGap = 0.2;
  const seriesWidth = groupWidth * (1 - barGap);
  const barWidth = seriesWidth / Math.max(series.length, 1);

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
      {categories.map((category, categoryIndex) => {
        const groupCenter = plot.x + groupWidth * categoryIndex + groupWidth / 2;
        return series.map((item, seriesIndex) => {
          const value = item.data[categoryIndex] ?? 0;
          const color =
            item.fills?.[categoryIndex] ??
            item.color ??
            resolveSeriesColor(item.tone, seriesIndex);
          const x =
            groupCenter -
            seriesWidth / 2 +
            seriesIndex * barWidth +
            barWidth * 0.1;
          const y = yAt(value, min, max, plot);
          const baseline = yAt(Math.max(min, 0), min, max, plot);
          const barHeight = Math.max(1, baseline - y);
          return (
            <rect
              key={`${category}-${item.name}`}
              x={x}
              y={y}
              width={Math.max(1, barWidth * 0.8)}
              height={barHeight}
              fill={color}
              rx={theme.bar.radius}
            />
          );
        });
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
          {categories.map((category, index) => {
            const x = xAt(index, categories.length, plot);
            return (
              <text
                key={category}
                x={x}
                y={plot.y + plot.height + 14}
                textAnchor="middle"
                fill={chrome.axis}
                fontSize={10}
              >
                {category}
              </text>
            );
          })}
        </>
      ) : null}
    </svg>
  );
}
