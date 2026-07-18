"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
} from "react";
import {
  expandYRange,
  type PlotMarkerAnnotation,
} from "@axicharts/charts-canvas";
import { SERIES_COLORS } from "@axicharts/charts-canvas";
import {
  resolveCartesianPlotInsets,
  plotInnerSize,
} from "./cartesianPlotInsets";
import {
  normalizeDragMarkerPosition,
  markerPixelPosition,
} from "./dragMarker";

export type MarkerDragEndEvent = {
  marker: PlotMarkerAnnotation;
  x?: number | string;
  y: number;
  categoryIndex: number | null;
};

type DraggableMarkerOverlayProps = {
  width: number;
  height: number;
  categories: string[];
  seriesMin: number;
  seriesMax: number;
  markers: PlotMarkerAnnotation[];
  thresholdBands?: { min: number; max: number }[];
  referenceLines?: { value: number }[];
  dualAxis?: boolean;
  snapToCategories?: boolean;
  onDragEnd?: (event: MarkerDragEndEvent) => void;
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
  dualAxis = false,
  snapToCategories = true,
  onDragEnd,
}: DraggableMarkerOverlayProps): ReactElement | null {
  const [markerState, setMarkerState] = useState<MarkerState[]>(() =>
    markers.map((marker, index) => ({ ...marker, key: markerKey(marker, index) })),
  );
  const [draggingKey, setDraggingKey] = useState<string | null>(null);

  useEffect(() => {
    setMarkerState(
      markers.map((marker, index) => ({ ...marker, key: markerKey(marker, index) })),
    );
  }, [markers]);

  const insets = useMemo(
    () => resolveCartesianPlotInsets({ height, dualAxis }),
    [height, dualAxis],
  );
  const { height: plotHeight } = useMemo(
    () => plotInnerSize(width, height, insets),
    [width, height, insets],
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

  const positionForMarker = useCallback(
    (marker: MarkerState) =>
      markerPixelPosition({
        marker,
        categories,
        width,
        height,
        insets,
        yMin,
        yMax,
      }),
    [categories, height, insets, width, yMax, yMin],
  );

  const onPointerDown = useCallback(
    (key: string) => (event: React.PointerEvent<HTMLButtonElement>) => {
      event.currentTarget.setPointerCapture(event.pointerId);
      setDraggingKey(key);
      const startY = event.clientY;

      const marker = markerState.find((item) => item.key === key);
      if (!marker) return;

      const startMarkerY = marker.y;

      const onMove = (moveEvent: PointerEvent) => {
        const deltaY = moveEvent.clientY - startY;
        const next = normalizeDragMarkerPosition({
          startY: startMarkerY,
          deltaY,
          plotHeight,
          yMin,
          yMax,
          marker,
          categories,
          snapToCategories: false,
        });
        setMarkerState((current) =>
          current.map((item) =>
            item.key === key ? { ...item, y: next.y } : item,
          ),
        );
      };

      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        setDraggingKey(null);

        setMarkerState((current) => {
          const dragged = current.find((item) => item.key === key);
          if (!dragged) return current;

          const snapped = normalizeDragMarkerPosition({
            startY: dragged.y,
            deltaY: 0,
            plotHeight,
            yMin,
            yMax,
            marker: dragged,
            categories,
            snapToCategories,
          });

          const nextState = current.map((item) =>
            item.key === key
              ? { ...item, x: snapped.x, y: snapped.y }
              : item,
          );

          onDragEnd?.({
            marker: {
              x: snapped.x,
              y: snapped.y,
              label: dragged.label,
              tone: dragged.tone,
              draggable: dragged.draggable,
              id: dragged.id,
            },
            x: snapped.x,
            y: snapped.y,
            categoryIndex: snapped.categoryIndex,
          });

          return nextState;
        });
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [
      categories,
      markerState,
      onDragEnd,
      plotHeight,
      snapToCategories,
      yMax,
      yMin,
    ],
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
        const isDragging = draggingKey === marker.key;

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
              width: 14,
              height: 14,
              borderRadius: 999,
              border: `2px solid ${color}`,
              background: color,
              boxShadow: isDragging
                ? `0 0 0 3px ${color}33`
                : "0 1px 2px rgba(15, 23, 42, 0.2)",
              cursor: isDragging ? "grabbing" : "grab",
              pointerEvents: "auto",
              padding: 0,
              touchAction: "none",
            }}
          />
        );
      })}
    </div>
  );
}
