"use client";

import { useEffect, useRef } from "react";
import * as echarts from "echarts/core";
import type { EChartsOption } from "echarts";

type UseEChartOptions = {
  option: EChartsOption;
  width: number;
  height: number;
  categories?: string[];
  chartId?: string;
  onSyncIndex?: (index: number | null) => void;
  syncIndex?: number | null;
  syncSourceId?: string | null;
};

export function useEChart({
  option,
  width,
  height,
  categories,
  chartId,
  onSyncIndex,
  syncIndex,
  syncSourceId,
}: UseEChartOptions) {
  const rootRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);
  const onSyncIndexRef = useRef(onSyncIndex);
  const categoriesRef = useRef(categories);
  const applyingSyncRef = useRef(false);
  onSyncIndexRef.current = onSyncIndex;
  categoriesRef.current = categories;

  useEffect(() => {
    if (!rootRef.current || width < 1 || height < 1) return;

    const chart = echarts.init(rootRef.current, undefined, { renderer: "canvas" });
    chartRef.current = chart;

    const handleAxisPointer = (event: {
      axesInfo?: Array<{ value?: number | string }>;
    }) => {
      if (applyingSyncRef.current) return;
      const value = event.axesInfo?.[0]?.value;
      let index: number | null = null;
      if (typeof value === "number") {
        index = value;
      } else if (typeof value === "string" && categoriesRef.current) {
        index = categoriesRef.current.indexOf(value);
      }
      if (index != null && index >= 0) {
        onSyncIndexRef.current?.(index);
      }
    };

    const handleGlobalOut = () => {
      if (applyingSyncRef.current) return;
      onSyncIndexRef.current?.(null);
    };

    chart.on("updateAxisPointer", handleAxisPointer);
    chart.getZr().on("globalout", handleGlobalOut);

    return () => {
      chart.off("updateAxisPointer", handleAxisPointer);
      chart.getZr().off("globalout", handleGlobalOut);
      chart.dispose();
      chartRef.current = null;
    };
  }, [width, height]);

  useEffect(() => {
    chartRef.current?.setOption(option, { notMerge: true });
  }, [option]);

  useEffect(() => {
    chartRef.current?.resize({ width, height });
  }, [width, height]);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !chartId) return;
    if (syncSourceId === chartId) return;

    applyingSyncRef.current = true;
    if (syncIndex == null || syncIndex < 0) {
      chart.dispatchAction({ type: "hideTip" });
      chart.dispatchAction({ type: "downplay" });
    } else {
      chart.dispatchAction({
        type: "showTip",
        seriesIndex: 0,
        dataIndex: syncIndex,
      });
      chart.dispatchAction({
        type: "highlight",
        seriesIndex: 0,
        dataIndex: syncIndex,
      });
    }
    applyingSyncRef.current = false;
  }, [syncIndex, syncSourceId, chartId]);

  return rootRef;
}
