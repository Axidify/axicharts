"use client";

import type { ReactElement } from "react";
import type { ChartTheme } from "@axicharts/charts-theme";
import {
  resolveSeriesColor,
} from "@axicharts/charts-canvas";
import { chromeGridStroke, resolveChromeColors } from "@axicharts/charts-canvas";
import type { CartesianPlotSeries } from "../composable/customMarks";
import {
  areaPath,
  computeValueExtents,
  linePath,
  plotRect,
  xAt,
  yAt,
} from "./scales";
import {
  buildChartScales,
  ChartScalesProvider,
} from "./ChartScalesContext";
import { buildCartesianA11yDescriptor } from "../a11y/cartesianDescriptor";
import { SVG_A11Y_DESC_ID, SVG_A11Y_TITLE_ID, SvgA11yHead } from "../a11y/SvgA11yHead";

export type SvgCartesianLineProps = {
  width: number;
  height: number;
  categories: string[];
  series: CartesianPlotSeries[];
  theme: ChartTheme;
  fill?: boolean;
  showAxes?: boolean;
  stacked?: boolean;
  seriesEnterDelayMs?: (seriesIndex: number) => number;
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
  seriesEnterDelayMs,
}: SvgCartesianLineProps): ReactElement {
  const plot = plotRect(width, height);
  const { min, max } = computeValueExtents(series, stacked);
  const scales = buildChartScales({
    width,
    height,
    categories,
    yMin: min,
    yMax: max,
  });
  const chrome = resolveChromeColors(theme);
  const gridStroke = chromeGridStroke(theme, height < 72);
  const tickCount = Math.min(4, categories.length);
  const descriptor = buildCartesianA11yDescriptor({
    chartType: fill ? "area" : "line",
    categories,
    series,
  });

  return (
    <ChartScalesProvider value={scales}>
      <svg
        data-engine="svg"
        width={width}
        height={height}
        role="graphics-document"
        aria-labelledby={`${SVG_A11Y_TITLE_ID} ${SVG_A11Y_DESC_ID}`}
      >
        <SvgA11yHead descriptor={descriptor} />
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
          const defaultPath = fill
            ? areaPath(item.data, min, max, plot)
            : linePath(item.data, min, max, plot);

          if (item.renderPath) {
            return (
              <g key={item.name} data-series-custom="">
                {item.renderPath({
                  ...scales,
                  series: item,
                  seriesIndex,
                  color,
                  fill,
                  defaultPath,
                })}
              </g>
            );
          }

          return (
            <path
              key={item.name}
              data-series-line={fill ? undefined : ""}
              d={defaultPath}
              fill={fill ? color : "none"}
              fillOpacity={fill ? theme.area.fillOpacity : undefined}
              stroke={color}
              strokeWidth={theme.line.strokeWidth}
              strokeLinejoin="round"
              strokeLinecap="round"
              style={
                seriesEnterDelayMs
                  ? { animationDelay: `${seriesEnterDelayMs(seriesIndex)}ms` }
                  : undefined
              }
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
    </ChartScalesProvider>
  );
}
