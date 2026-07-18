import { useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";

export type LivePanelSpec = {
  id: string;
  label: string;
  base: number;
  variance: number;
  tone?: "default" | "info" | "success" | "warning" | "critical";
  stroke: string;
};

export type LivePanelState = {
  spec: LivePanelSpec;
  categories: string[];
  values: number[];
};

export const OPS_PANELS: LivePanelSpec[] = [
  { id: "cpu", label: "CPU", base: 62, variance: 14, tone: "warning", stroke: "#d97706" },
  { id: "memory", label: "Memory", base: 71, variance: 10, tone: "info", stroke: "#0891b2" },
  { id: "p95", label: "p95 latency", base: 48, variance: 18, tone: "default", stroke: "#2563eb" },
  { id: "errors", label: "Errors/min", base: 3.2, variance: 2.5, tone: "critical", stroke: "#dc2626" },
  { id: "throughput", label: "Throughput", base: 1180, variance: 220, tone: "success", stroke: "#16a34a" },
  { id: "queue", label: "Queue depth", base: 24, variance: 12, tone: "warning", stroke: "#7c3aed" },
];

export function createPanelState(spec: LivePanelSpec, pointCount: number): LivePanelState {
  const categories = Array.from({ length: pointCount }, (_, index) => String(index));
  const values = Array.from(
    { length: pointCount },
    (_, index) => spec.base + Math.sin(index / 36) * spec.variance,
  );
  return { spec, categories, values };
}

export function shiftSeries(values: number[]): number[] {
  const last = values[values.length - 1] ?? 0;
  const delta = (Math.random() - 0.5) * (Math.abs(last) * 0.05 + 0.8);
  return [...values.slice(1), Math.max(0, last + delta)];
}

function percentile(sorted: number[], p: number): number {
  const index = Math.min(
    sorted.length - 1,
    Math.max(0, Math.ceil(sorted.length * p) - 1),
  );
  return sorted[index] ?? 0;
}

export type LiveBenchState = {
  panels: LivePanelState[];
  frameMs: number;
  p95Ms: number;
  hz: number;
  pointCount: number;
  running: boolean;
  toggle: () => void;
};

export function useLiveOpsBench(
  pointCount: number,
  hz = 5,
  panelSpecs: LivePanelSpec[] = OPS_PANELS,
): LiveBenchState {
  const [running, setRunning] = useState(true);
  const [panels, setPanels] = useState<LivePanelState[]>(() =>
    panelSpecs.map((spec) => createPanelState(spec, pointCount)),
  );
  const [frameMs, setFrameMs] = useState(0);
  const [p95Ms, setP95Ms] = useState(0);
  const samplesRef = useRef<number[]>([]);

  useEffect(() => {
    setPanels(panelSpecs.map((spec) => createPanelState(spec, pointCount)));
    samplesRef.current = [];
    setFrameMs(0);
    setP95Ms(0);
  }, [pointCount, panelSpecs]);

  useEffect(() => {
    if (!running) return;

    const id = window.setInterval(() => {
      const start = performance.now();
      flushSync(() => {
        setPanels((current) =>
          current.map((panel) => ({
            ...panel,
            values: shiftSeries(panel.values),
          })),
        );
      });
      const elapsed = performance.now() - start;
      const samples = [...samplesRef.current, elapsed].slice(-30);
      samplesRef.current = samples;
      const sorted = [...samples].sort((a, b) => a - b);
      setFrameMs(elapsed);
      setP95Ms(percentile(sorted, 0.95));
    }, 1000 / hz);

    return () => window.clearInterval(id);
  }, [hz, running]);

  return useMemo(
    () => ({
      panels,
      frameMs,
      p95Ms,
      hz,
      pointCount,
      running,
      toggle: () => setRunning((value) => !value),
    }),
    [panels, frameMs, p95Ms, hz, pointCount, running],
  );
}

export function formatMetric(spec: LivePanelSpec, value: number): string {
  if (spec.id === "throughput") return `${Math.round(value)}`;
  if (spec.id === "errors") return value.toFixed(1);
  if (spec.id === "p95") return `${value.toFixed(0)} ms`;
  if (spec.id === "cpu" || spec.id === "memory") return `${value.toFixed(0)}%`;
  return value.toFixed(0);
}
