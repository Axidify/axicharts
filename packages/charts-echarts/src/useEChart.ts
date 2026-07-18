"use client";

import { useEffect, useRef } from "react";
import * as echarts from "echarts/core";
import type { EChartsOption } from "echarts";

export type EChartItemHoverEvent = {
  title: string;
  rows: Array<{ label: string; value: string; color?: string }>;
  left: number;
  top: number;
} | null;

export type EChartCursorEvent = {
  index: number;
  left: number;
  top: number;
} | null;

export type EChartBrushRange = {
  start: number;
  end: number;
};

type UseEChartOptions = {
  option: EChartsOption;
  width: number;
  height: number;
  categories?: string[];
  chartId?: string;
  onSyncIndex?: (index: number | null) => void;
  syncIndex?: number | null;
  syncSourceId?: string | null;
  onCursor?: (event: EChartCursorEvent) => void;
  onBrushRange?: (range: EChartBrushRange | null) => void;
  onItemHover?: (event: EChartItemHoverEvent) => void;
  mergeOption?: boolean;
  formatItemHover?: (params: {
    name?: string;
    value?: unknown;
    color?: string;
    data?: unknown;
    event?: { event?: MouseEvent };
  }) => EChartItemHoverEvent | null;
};

function resolveCursorLeft(
  chart: echarts.ECharts,
  index: number,
  categories: string[] | undefined,
): number {
  if (!categories || index < 0 || index >= categories.length) return 0;
  const pixel = chart.convertToPixel({ xAxisIndex: 0 }, categories[index]);
  if (typeof pixel === "number") return pixel;
  if (Array.isArray(pixel)) return pixel[0] ?? 0;
  return 0;
}

export function useEChart({
  option,
  width,
  height,
  categories,
  chartId,
  onSyncIndex,
  syncIndex,
  syncSourceId,
  onCursor,
  onBrushRange,
  onItemHover,
  mergeOption = false,
  formatItemHover,
}: UseEChartOptions) {
  const rootRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);
  const onSyncIndexRef = useRef(onSyncIndex);
  const onCursorRef = useRef(onCursor);
  const onBrushRangeRef = useRef(onBrushRange);
  const onItemHoverRef = useRef(onItemHover);
  const formatItemHoverRef = useRef(formatItemHover);
  const categoriesRef = useRef(categories);
  const applyingSyncRef = useRef(false);
  onSyncIndexRef.current = onSyncIndex;
  onCursorRef.current = onCursor;
  onBrushRangeRef.current = onBrushRange;
  onItemHoverRef.current = onItemHover;
  formatItemHoverRef.current = formatItemHover;
  categoriesRef.current = categories;

  useEffect(() => {
    if (!rootRef.current || width < 1 || height < 1) return;

    const chart = echarts.init(rootRef.current, undefined, { renderer: "canvas" });
    chartRef.current = chart;

    const publishCursor = (index: number | null) => {
      if (index == null || index < 0) {
        onCursorRef.current?.(null);
        return;
      }
      onCursorRef.current?.({
        index,
        left: resolveCursorLeft(chart, index, categoriesRef.current),
        top: 0,
      });
    };

    const handleAxisPointer = (...args: unknown[]) => {
      if (applyingSyncRef.current) return;
      const event = args[0] as {
        axesInfo?: Array<{ value?: number | string }>;
      };
      const value = event.axesInfo?.[0]?.value;
      let index: number | null = null;
      if (typeof value === "number") {
        index = value;
      } else if (typeof value === "string" && categoriesRef.current) {
        index = categoriesRef.current.indexOf(value);
      }
      if (index != null && index >= 0) {
        onSyncIndexRef.current?.(index);
        publishCursor(index);
      }
    };

    const handleGlobalOut = () => {
      if (applyingSyncRef.current) return;
      onSyncIndexRef.current?.(null);
      onCursorRef.current?.(null);
      onItemHoverRef.current?.(null);
    };

    const handleMouseOver = (...args: unknown[]) => {
      if (!onItemHoverRef.current) return;
      const params = args[0] as {
        componentType?: string;
        name?: string;
        value?: unknown;
        color?: string;
        data?: unknown;
        event?: { event?: MouseEvent };
      };
      if (params.componentType !== "series") return;
      const mouse = params.event?.event;
      if (!mouse) return;

      const formatted = formatItemHoverRef.current?.(params);
      if (formatted) {
        onItemHoverRef.current(formatted);
        return;
      }

      if (params.name == null) return;
      const value =
        typeof params.value === "number"
          ? String(params.value)
          : Array.isArray(params.value)
            ? String(params.value[2] ?? params.value[0])
            : String(params.value ?? "");
      onItemHoverRef.current({
        title: params.name,
        rows: [{ label: "Value", value, color: params.color }],
        left: mouse.offsetX,
        top: mouse.offsetY,
      });
    };

    const handleMouseOut = (...args: unknown[]) => {
      const params = args[0] as { componentType?: string };
      if (params.componentType !== "series") return;
      onItemHoverRef.current?.(null);
    };

    const handleDataZoom = (...args: unknown[]) => {
      if (!onBrushRangeRef.current) return;
      const event = args[0] as {
        batch?: Array<{ start?: number; end?: number }>;
        start?: number;
        end?: number;
      };
      const batch = event.batch?.[0];
      const start = batch?.start ?? event.start;
      const end = batch?.end ?? event.end;
      if (typeof start === "number" && typeof end === "number") {
        onBrushRangeRef.current({ start, end });
      }
    };

    chart.on("updateAxisPointer", handleAxisPointer);
    chart.getZr().on("globalout", handleGlobalOut);
    chart.on("mouseover", handleMouseOver);
    chart.on("mouseout", handleMouseOut);
    chart.on("datazoom", handleDataZoom);

    return () => {
      chart.off("updateAxisPointer", handleAxisPointer);
      chart.getZr().off("globalout", handleGlobalOut);
      chart.off("mouseover", handleMouseOver);
      chart.off("mouseout", handleMouseOut);
      chart.off("datazoom", handleDataZoom);
      chart.dispose();
      chartRef.current = null;
    };
  }, [width, height]);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    chart.setOption(option, {
      notMerge: !mergeOption,
      lazyUpdate: mergeOption,
      replaceMerge: mergeOption ? ["series"] : undefined,
    });
    if (onBrushRangeRef.current && option.dataZoom) {
      const dataZoom = option.dataZoom;
      const zooms = Array.isArray(dataZoom) ? dataZoom : [dataZoom];
      const primary = zooms.find((zoom) => zoom.type === "slider") ?? zooms[0];
      if (
        primary &&
        typeof primary.start === "number" &&
        typeof primary.end === "number"
      ) {
        onBrushRangeRef.current({ start: primary.start, end: primary.end });
      }
    }
  }, [option, mergeOption]);

  useEffect(() => {
    chartRef.current?.resize({ width, height });
  }, [width, height]);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !chartId) return;
    if (syncSourceId === chartId) return;

    applyingSyncRef.current = true;
    if (syncIndex == null || syncIndex < 0) {
      chart.dispatchAction({ type: "downplay" });
      onCursorRef.current?.(null);
    } else {
      chart.dispatchAction({
        type: "highlight",
        seriesIndex: 0,
        dataIndex: syncIndex,
      });
      onCursorRef.current?.({
        index: syncIndex,
        left: resolveCursorLeft(chart, syncIndex, categoriesRef.current),
        top: 0,
      });
    }
    applyingSyncRef.current = false;
  }, [syncIndex, syncSourceId, chartId]);

  return rootRef;
}
