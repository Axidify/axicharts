"use client";

import { useCallback, useMemo, useState, type ReactElement } from "react";
import {
  categoryToIndex,
  expandYRange,
  type PlotMarkerAnnotation,
} from "@axicharts/charts-canvas";
import { SERIES_COLORS } from "@axicharts/charts-canvas";

type DraggableMarkerOverlayProps = {
  width: number;
  height: number;
  categories: string[];
  seriesMin: number;
  seriesMax: number;
  markers: PlotMarkerAnnotation[];
  thresholdBands?: { min: number; max: number }[];
  referenceLines?: { value: number }[];
};

type MarkerState = PlotMarkerAnnotation & { key: string };

function markerKey(marker: PlotMarkerAnnotation, index: number): string {
  return marker.id ?? `${String(marker.x)}-${marker.y}-${index}`;
}

export function DraggableMarkerOverlay({
  width,
  height,
  categories,
  seriesMin,
  seriesMax,
  markers,
  thresholdBands = [],
  referenceLines = [],
}: DraggableMarkerOverlayProps): ReactElement | null {
  const [markerState, setMarkerState] = useState<MarkerState[]>(() =>
    markers.map((marker, index) => ({ ...marker, key: markerKey(marker, index) })),
  );

  const [yMin, yMax] = useMemo(() => {
    const markerYs = markerState.map((marker) => marker.y);
    return expandYRange(
      seriesMin,
      seriesMax,
      thresholdBands,
      referenceLines,
      markerYs,
    );
  }, [seriesMin, seriesMax, thresholdBands, referenceLines, markerState]);

  const plotPadding = useMemo(
    () => ({
      top: 8,
      right: 10,
      bottom: 8,
      left: 10,
    }),
    [],
  );

  const plotWidth = Math.max(1, width - plotPadding.left - plotPadding.right);
  const plotHeight = Math.max(1, height - plotPadding.top - plotPadding.bottom);

  const positionForMarker = useCallback(
    (marker: MarkerState) => {
      const index = categoryToIndex(marker.x, categories);
      const xRatio =
        index != null && categories.length > 1
          ? index / (categories.length - 1)
          : index != null
            ? 0.5
            : 0.5;
      const yRatio = (marker.y - yMin) / (yMax - yMin || 1);
      return {
        left: plotPadding.left + xRatio * plotWidth,
        top: plotPadding.top + (1 - yRatio) * plotHeight,
      };
    },
    [categories, plotHeight, plotPadding.left, plotPadding.top, plotWidth, yMax, yMin],
  );

  const onPointerDown = useCallback(
    (key: string) => (event: React.PointerEvent<HTMLButtonElement>) => {
      event.currentTarget.setPointerCapture(event.pointerId);
      const startY = event.clientY;

      const marker = markerState.find((item) => item.key === key);
      if (!marker) return;

      const startMarkerY = marker.y;

      const onMove = (moveEvent: PointerEvent) => {
        const deltaY = moveEvent.clientY - startY;
        const valueDelta = -(deltaY / plotHeight) * (yMax - yMin);
        const nextY = Math.min(yMax, Math.max(yMin, startMarkerY + valueDelta));
        setMarkerState((current) =>
          current.map((item) =>
            item.key === key ? { ...item, y: nextY } : item,
          ),
        );
      };

      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [markerState, plotHeight, yMax, yMin],
  );

  if (markerState.length === 0) return null;

  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
      }}
    >
      {markerState.map((marker) => {
        const { left, top } = positionForMarker(marker);
        const color = SERIES_COLORS[marker.tone ?? "warning"];

        return (
          <button
            key={marker.key}
            type="button"
            aria-label={marker.label ?? "Draggable marker"}
            onPointerDown={onPointerDown(marker.key)}
            style={{
              position: "absolute",
              left,
              top,
              transform: "translate(-50%, -50%)",
              width: 12,
              height: 12,
              borderRadius: 999,
              border: `2px solid ${color}`,
              background: color,
              cursor: "grab",
              pointerEvents: "auto",
              padding: 0,
            }}
          />
        );
      })}
    </div>
  );
}
