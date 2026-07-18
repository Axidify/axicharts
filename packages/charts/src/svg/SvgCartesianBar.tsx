"use client";

import type { ReactElement } from "react";
import type { ChartTheme } from "@axicharts/charts-theme";
import {
  resolveSeriesColor,
} from "@axicharts/charts-canvas";
import { chromeGridStroke, resolveChromeColors } from "@axicharts/charts-canvas";
import type { CartesianPlotSeries } from "../composable/customMarks";
import {
  computeValueExtents,
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
import {
  StudioBarRect,
  StudioGridLines,
  studioAxisFontSize,
  studioFlag,
  studioSeriesId,
} from "./studioPolish";

export type SvgCartesianBarProps = {
  width: number;
  height: number;
  categories: string[];
  series: CartesianPlotSeries[];
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
  const scales = buildChartScales({
    width,
    height,
    categories,
    yMin: min,
    yMax: max,
  });
  const chrome = resolveChromeColors(theme);
  const gridStroke = chromeGridStroke(theme, height < 72);
  const groupWidth = plot.width / Math.max(categories.length, 1);
  const barGap = 0.2;
  const seriesWidth = groupWidth * (1 - barGap);
  const barWidth = seriesWidth / Math.max(series.length, 1);
  const axisFontSize = studioAxisFontSize(theme);
  const useStudioBars = studioFlag(theme, "barHighlight");
  const descriptor = buildCartesianA11yDescriptor({
    chartType: "bar",
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
        <StudioGridLines theme={theme} plot={plot} gridStroke={gridStroke} />
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
            const rectWidth = Math.max(1, barWidth * 0.8);
            const bar = { x, y, width: rectWidth, height: barHeight };
            const barId = `${studioSeriesId(item.name, seriesIndex)}-${categoryIndex}`;

            if (item.renderBar) {
              return (
                <g
                  key={`${category}-${item.name}`}
                  data-series-custom=""
                >
                  {item.renderBar({
                    ...scales,
                    series: item,
                    seriesIndex,
                    categoryIndex,
                    category,
                    value,
                    color,
                    bar,
                  })}
                </g>
              );
            }

            if (useStudioBars) {
              return (
                <StudioBarRect
                  key={`${category}-${item.name}`}
                  id={barId}
                  x={x}
                  y={y}
                  width={rectWidth}
                  height={barHeight}
                  color={color}
                  radius={theme.bar.radius}
                />
              );
            }

            return (
              <rect
                key={`${category}-${item.name}`}
                x={x}
                y={y}
                width={rectWidth}
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
                  fontSize={axisFontSize}
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  {category}
                </text>
              );
            })}
          </>
        ) : null}
      </svg>
    </ChartScalesProvider>
  );
}
