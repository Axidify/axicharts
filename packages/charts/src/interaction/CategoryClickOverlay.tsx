"use client";

import type { CSSProperties, ReactElement } from "react";
import { useCallback } from "react";
import type { PlotSeries } from "@axicharts/charts-canvas";
import {
  resolveCartesianPlotInsets,
  plotInnerSize,
} from "../annotations/cartesianPlotInsets";
import {
  buildChartPointerEvent,
  type ChartPointerEvent,
  type ChartSeriesInput,
} from "./chartPointerEvent";

export type CategoryClickOverlayProps = {
  width: number;
  height: number;
  categories: string[];
  categoryMeta: unknown[];
  series: ChartSeriesInput[];
  compact?: boolean;
  dualAxis?: boolean;
  showLegend?: boolean;
  orientation?: "vertical" | "horizontal";
  selectedCategoryIndex?: number;
  onCategoryClick?: (event: ChartPointerEvent) => void;
  onSeriesClick?: (event: ChartPointerEvent) => void;
};

export function CategoryClickOverlay({
  width,
  height,
  categories,
  categoryMeta,
  series,
  compact = false,
  dualAxis = false,
  showLegend = false,
  orientation = "vertical",
  selectedCategoryIndex,
  onCategoryClick,
  onSeriesClick,
}: CategoryClickOverlayProps): ReactElement | null {
  const insets = resolveCartesianPlotInsets({
    height,
    dualAxis,
    showLegend,
    compact,
    orientation,
    categories,
  });
  const inner = plotInnerSize(width, height, insets);

  const emit = useCallback(
    (categoryIndex: number, seriesIndex: number | null, nativeEvent: globalThis.Event) => {
      const payload = buildChartPointerEvent({
        categoryIndex,
        labels: categories,
        categoryMeta,
        series,
        seriesIndex,
        nativeEvent,
      });
      if (seriesIndex != null && onSeriesClick) {
        onSeriesClick(payload);
      } else if (onCategoryClick) {
        onCategoryClick(payload);
      }
    },
    [categories, categoryMeta, onCategoryClick, onSeriesClick, series],
  );

  if (!onCategoryClick && !onSeriesClick) {
    return null;
  }

  const horizontal = orientation === "horizontal";
  const bandCount = Math.max(categories.length, 1);
  const columnWidth = inner.width / bandCount;
  const rowHeight = inner.height / bandCount;

  const containerStyle: CSSProperties = {
    position: "absolute",
    left: insets.left,
    top: insets.top,
    width: inner.width,
    height: inner.height,
    display: "flex",
    flexDirection: horizontal ? "column" : "row",
    pointerEvents: "none",
    zIndex: 4,
  };

  return (
    <div style={containerStyle} aria-hidden={false}>
      {categories.map((label, index) => {
        const selected = selectedCategoryIndex === index;
        const bandStyle: CSSProperties = {
          flex: 1,
          position: "relative",
          pointerEvents: "auto",
          cursor: "pointer",
          background: selected ? "rgba(59, 130, 246, 0.12)" : "transparent",
          borderRight:
            !horizontal && index < categories.length - 1
              ? "1px solid transparent"
              : undefined,
          borderBottom:
            horizontal && index < categories.length - 1
              ? "1px solid transparent"
              : undefined,
        };
        return (
          <button
            key={`${label}-${index}`}
            type="button"
            aria-label={`Filter by ${label}`}
            aria-pressed={selected}
            style={{
              ...bandStyle,
              border: "none",
              padding: 0,
              margin: 0,
              background: bandStyle.background,
            }}
            onClick={(e) => emit(index, null, e.nativeEvent)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                emit(index, null, e.nativeEvent);
              }
            }}
          />
        );
      })}
      {selectedCategoryIndex != null && selectedCategoryIndex >= 0 ? (
        <div
          style={
            horizontal
              ? {
                  position: "absolute",
                  left: 0,
                  top: rowHeight * selectedCategoryIndex,
                  width: "100%",
                  height: rowHeight,
                  borderTop: "2px solid rgba(59, 130, 246, 0.55)",
                  borderBottom: "2px solid rgba(59, 130, 246, 0.55)",
                  pointerEvents: "none",
                }
              : {
                  position: "absolute",
                  left: columnWidth * selectedCategoryIndex,
                  top: 0,
                  width: columnWidth,
                  height: "100%",
                  borderLeft: "2px solid rgba(59, 130, 246, 0.55)",
                  borderRight: "2px solid rgba(59, 130, 246, 0.55)",
                  pointerEvents: "none",
                }
          }
        />
      ) : null}
    </div>
  );
}
