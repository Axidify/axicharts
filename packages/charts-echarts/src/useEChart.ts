"use client";

import { useEffect, useRef } from "react";
import * as echarts from "echarts/core";
import type { EChartsOption } from "echarts";

type UseEChartOptions = {
  option: EChartsOption;
  width: number;
  height: number;
};

export function useEChart({ option, width, height }: UseEChartOptions) {
  const rootRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!rootRef.current || width < 1 || height < 1) return;

    const chart = echarts.init(rootRef.current, undefined, { renderer: "canvas" });
    chartRef.current = chart;

    return () => {
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

  return rootRef;
}
