import { useEffect, useRef, type ReactElement } from "react";
import * as echarts from "echarts";
import type { PanelProps } from "./AxiPanel";

export function EChartsPanel({ categories, values }: PanelProps): ReactElement {
  const rootRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    const chart = echarts.init(rootRef.current, undefined, {
      renderer: "canvas",
      width: 320,
      height: 120,
    });
    chartRef.current = chart;

    return () => {
      chart.dispose();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    chartRef.current?.setOption(
      {
        animation: false,
        grid: { left: 0, right: 0, top: 0, bottom: 0 },
        xAxis: { type: "category", data: categories, show: false },
        yAxis: { type: "value", show: false },
        series: [
          {
            type: "line",
            data: values,
            showSymbol: false,
            lineStyle: { width: 2, color: "#3b82f6" },
          },
        ],
      },
      { notMerge: true },
    );
  }, [categories, values]);

  return <div ref={rootRef} className="panel" />;
}
