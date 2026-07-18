import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ProfilerOnRenderCallback,
} from "react";
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

const EXTRA_PANELS: LivePanelSpec[] = [
  { id: "disk", label: "Disk I/O", base: 340, variance: 80, tone: "info", stroke: "#0d9488" },
  { id: "network", label: "Network", base: 890, variance: 160, tone: "success", stroke: "#65a30d" },
  { id: "connections", label: "Connections", base: 412, variance: 90, tone: "default", stroke: "#4f46e5" },
  { id: "gc", label: "GC pause", base: 12, variance: 6, tone: "warning", stroke: "#ea580c" },
];

const PANEL_PALETTE = [
  "#2563eb",
  "#d97706",
  "#16a34a",
  "#dc2626",
  "#7c3aed",
  "#0891b2",
  "#0d9488",
  "#ea580c",
];

const PANEL_TONES: LivePanelSpec["tone"][] = [
  "default",
  "info",
  "success",
  "warning",
  "critical",
];

export function getPanelSpecs(panelCount: number): LivePanelSpec[] {
  const base = [...OPS_PANELS, ...EXTRA_PANELS];
  if (panelCount <= base.length) return base.slice(0, panelCount);

  return Array.from({ length: panelCount }, (_, index) => {
    const seed = base[index % base.length]!;
    return {
      id: `metric-${index + 1}`,
      label: `Metric ${index + 1}`,
      base: seed.base * (0.85 + (index % 5) * 0.05),
      variance: seed.variance,
      tone: PANEL_TONES[index % PANEL_TONES.length],
      stroke: PANEL_PALETTE[index % PANEL_PALETTE.length]!,
    };
  });
}

export type BenchPresetId = "standard" | "heavy" | "extreme";

export type BenchPreset = {
  id: BenchPresetId;
  label: string;
  panelCount: number;
  pointCount: number;
  hz: number;
  panelHeight: number;
  description: string;
};

export const BENCH_PRESETS: Record<BenchPresetId, BenchPreset> = {
  standard: {
    id: "standard",
    label: "Standard",
    panelCount: 6,
    pointCount: 2000,
    hz: 5,
    panelHeight: 88,
    description: "Published benchmark — 6 × 2000 pts @ 5 Hz",
  },
  heavy: {
    id: "heavy",
    label: "Heavy",
    panelCount: 8,
    pointCount: 3000,
    hz: 5,
    panelHeight: 80,
    description: "8 panels × 3000 pts @ 5 Hz",
  },
  extreme: {
    id: "extreme",
    label: "Extreme",
    panelCount: 10,
    pointCount: 10000,
    hz: 10,
    panelHeight: 72,
    description: "10 panels × 10000 pts @ 10 Hz — pushes Recharts hard",
  },
};

export const FRAME_BUDGET_MS = 16;

export function getPanelGridColumns(panelCount: number): number {
  if (panelCount <= 4) return 2;
  if (panelCount <= 6) return 3;
  if (panelCount <= 8) return 4;
  return 5;
}

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

export function percentile(sorted: number[], p: number): number {
  const index = Math.min(
    sorted.length - 1,
    Math.max(0, Math.ceil(sorted.length * p) - 1),
  );
  return sorted[index] ?? 0;
}

export type TimingMetrics = {
  frameMs: number;
  p50Ms: number;
  p95Ms: number;
  maxMs: number;
  cumulativeMs: number;
  sampleCount: number;
  overBudgetFrames: number;
  severeJankFrames: number;
};

export function createEmptyTimingMetrics(): TimingMetrics {
  return {
    frameMs: 0,
    p50Ms: 0,
    p95Ms: 0,
    maxMs: 0,
    cumulativeMs: 0,
    sampleCount: 0,
    overBudgetFrames: 0,
    severeJankFrames: 0,
  };
}

function buildTimingMetrics(
  samples: number[],
  cumulativeMs: number,
  overBudgetFrames: number,
  severeJankFrames: number,
): TimingMetrics {
  const sorted = [...samples].sort((a, b) => a - b);
  const last = samples[samples.length - 1] ?? 0;
  return {
    frameMs: last,
    p50Ms: percentile(sorted, 0.5),
    p95Ms: percentile(sorted, 0.95),
    maxMs: sorted[sorted.length - 1] ?? 0,
    cumulativeMs,
    sampleCount: samples.length,
    overBudgetFrames,
    severeJankFrames,
  };
}

export function useTimingMetrics(
  budgetMs = FRAME_BUDGET_MS,
  windowSize = 60,
): {
  metrics: TimingMetrics;
  record: (elapsed: number) => void;
  flush: () => void;
  reset: () => void;
  onProfilerRender: ProfilerOnRenderCallback;
} {
  const samplesRef = useRef<number[]>([]);
  const cumulativeRef = useRef(0);
  const overBudgetRef = useRef(0);
  const severeJankRef = useRef(0);
  const [metrics, setMetrics] = useState<TimingMetrics>(createEmptyTimingMetrics);

  const reset = useCallback(() => {
    samplesRef.current = [];
    cumulativeRef.current = 0;
    overBudgetRef.current = 0;
    severeJankRef.current = 0;
    setMetrics(createEmptyTimingMetrics());
  }, []);

  const record = useCallback(
    (elapsed: number) => {
      cumulativeRef.current += elapsed;
      if (elapsed > budgetMs) overBudgetRef.current += 1;
      if (elapsed > budgetMs * 2) severeJankRef.current += 1;
      samplesRef.current = [...samplesRef.current, elapsed].slice(-windowSize);
    },
    [budgetMs, windowSize],
  );

  const flush = useCallback(() => {
    setMetrics(
      buildTimingMetrics(
        samplesRef.current,
        cumulativeRef.current,
        overBudgetRef.current,
        severeJankRef.current,
      ),
    );
  }, []);

  const onProfilerRender = useCallback<ProfilerOnRenderCallback>(
    (_id, phase, actualDuration) => {
      if (phase === "mount" && actualDuration < 0.01) return;
      record(actualDuration);
    },
    [record],
  );

  return { metrics, record, flush, reset, onProfilerRender };
}

export type LiveBenchConfig = {
  panelCount: number;
  pointCount: number;
  hz: number;
  panelSpecs?: LivePanelSpec[];
  autoThrottleRecharts?: boolean;
};

export type LiveBenchState = {
  panels: LivePanelState[];
  rechartsPanels: LivePanelState[];
  frameMs: number;
  p50Ms: number;
  p95Ms: number;
  maxMs: number;
  cumulativeMs: number;
  overBudgetFrames: number;
  severeJankFrames: number;
  hz: number;
  effectiveRechartsHz: number;
  pointCount: number;
  panelCount: number;
  running: boolean;
  rechartsThrottled: boolean;
  rechartsSkipRatio: number;
  toggle: () => void;
};

export function useLiveOpsBench({
  panelCount,
  pointCount,
  hz,
  panelSpecs,
  autoThrottleRecharts = false,
}: LiveBenchConfig): LiveBenchState {
  const specs = useMemo(
    () => panelSpecs ?? getPanelSpecs(panelCount),
    [panelCount, panelSpecs],
  );
  const [running, setRunning] = useState(true);
  const [panels, setPanels] = useState<LivePanelState[]>(() =>
    specs.map((spec) => createPanelState(spec, pointCount)),
  );
  const [rechartsPanels, setRechartsPanels] = useState<LivePanelState[]>(() =>
    specs.map((spec) => createPanelState(spec, pointCount)),
  );
  const [frameMs, setFrameMs] = useState(0);
  const [p50Ms, setP50Ms] = useState(0);
  const [p95Ms, setP95Ms] = useState(0);
  const [maxMs, setMaxMs] = useState(0);
  const [cumulativeMs, setCumulativeMs] = useState(0);
  const [overBudgetFrames, setOverBudgetFrames] = useState(0);
  const [severeJankFrames, setSevereJankFrames] = useState(0);
  const [rechartsSkipRatio, setRechartsSkipRatio] = useState(1);
  const samplesRef = useRef<number[]>([]);
  const cumulativeRef = useRef(0);
  const overBudgetRef = useRef(0);
  const severeJankRef = useRef(0);
  const tickRef = useRef(0);
  const rechartsSkipRef = useRef(1);

  useEffect(() => {
    const seeded = specs.map((spec) => createPanelState(spec, pointCount));
    setPanels(seeded);
    setRechartsPanels(seeded.map((panel) => ({ ...panel, values: [...panel.values] })));
    samplesRef.current = [];
    cumulativeRef.current = 0;
    overBudgetRef.current = 0;
    severeJankRef.current = 0;
    tickRef.current = 0;
    rechartsSkipRef.current = 1;
    setRechartsSkipRatio(1);
    setFrameMs(0);
    setP50Ms(0);
    setP95Ms(0);
    setMaxMs(0);
    setCumulativeMs(0);
    setOverBudgetFrames(0);
    setSevereJankFrames(0);
  }, [pointCount, specs]);

  useEffect(() => {
    if (!running) return;

    const id = window.setInterval(() => {
      const start = performance.now();
      let nextPanels: LivePanelState[] = [];
      flushSync(() => {
        setPanels((current) => {
          nextPanels = current.map((panel) => ({
            ...panel,
            values: shiftSeries(panel.values),
          }));
          return nextPanels;
        });

        tickRef.current += 1;
        const shouldUpdateRecharts = tickRef.current % rechartsSkipRef.current === 0;
        if (shouldUpdateRecharts) {
          setRechartsPanels(
            nextPanels.map((panel) => ({
              ...panel,
              values: [...panel.values],
            })),
          );
        }
      });
      const elapsed = performance.now() - start;
      cumulativeRef.current += elapsed;
      if (elapsed > FRAME_BUDGET_MS) overBudgetRef.current += 1;
      if (elapsed > FRAME_BUDGET_MS * 2) severeJankRef.current += 1;

      const samples = [...samplesRef.current, elapsed].slice(-60);
      samplesRef.current = samples;
      const sorted = [...samples].sort((a, b) => a - b);

      setFrameMs(elapsed);
      setP50Ms(percentile(sorted, 0.5));
      setP95Ms(percentile(sorted, 0.95));
      setMaxMs(sorted[sorted.length - 1] ?? 0);
      setCumulativeMs(cumulativeRef.current);
      setOverBudgetFrames(overBudgetRef.current);
      setSevereJankFrames(severeJankRef.current);

      if (autoThrottleRecharts && elapsed > FRAME_BUDGET_MS) {
        const nextSkip = Math.min(8, rechartsSkipRef.current * 2);
        if (nextSkip !== rechartsSkipRef.current) {
          rechartsSkipRef.current = nextSkip;
          setRechartsSkipRatio(nextSkip);
        }
      } else if (autoThrottleRecharts && elapsed < FRAME_BUDGET_MS * 0.75 && rechartsSkipRef.current > 1) {
        const nextSkip = Math.max(1, Math.floor(rechartsSkipRef.current / 2));
        rechartsSkipRef.current = nextSkip;
        setRechartsSkipRatio(nextSkip);
      }
    }, 1000 / hz);

    return () => window.clearInterval(id);
  }, [autoThrottleRecharts, hz, running]);

  const effectiveRechartsHz = hz / rechartsSkipRatio;

  return useMemo(
    () => ({
      panels,
      rechartsPanels,
      frameMs,
      p50Ms,
      p95Ms,
      maxMs,
      cumulativeMs,
      overBudgetFrames,
      severeJankFrames,
      hz,
      effectiveRechartsHz,
      pointCount,
      panelCount: specs.length,
      running,
      rechartsThrottled: rechartsSkipRatio > 1,
      rechartsSkipRatio,
      toggle: () => setRunning((value) => !value),
    }),
    [
      panels,
      rechartsPanels,
      frameMs,
      p50Ms,
      p95Ms,
      maxMs,
      cumulativeMs,
      overBudgetFrames,
      severeJankFrames,
      hz,
      effectiveRechartsHz,
      pointCount,
      specs.length,
      running,
      rechartsSkipRatio,
    ],
  );
}

export function formatMetric(spec: LivePanelSpec, value: number): string {
  if (spec.id === "throughput" || spec.id === "network") return `${Math.round(value)}`;
  if (spec.id === "errors") return value.toFixed(1);
  if (spec.id === "p95" || spec.id === "gc") return `${value.toFixed(0)} ms`;
  if (spec.id === "cpu" || spec.id === "memory") return `${value.toFixed(0)}%`;
  return value.toFixed(0);
}

export function formatMultiplier(ratio: number): string {
  if (!Number.isFinite(ratio) || ratio <= 0) return "—";
  return `${ratio.toFixed(1)}×`;
}

export function isStruggling(metrics: TimingMetrics, budgetMs = FRAME_BUDGET_MS): boolean {
  return metrics.sampleCount >= 5 && metrics.p95Ms > budgetMs;
}
