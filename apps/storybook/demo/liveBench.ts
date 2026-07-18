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

/** Synthetic load-generator panels — not real ops telemetry. */
export function getPanelSpecs(panelCount: number): LivePanelSpec[] {
  return Array.from({ length: panelCount }, (_, index) => ({
    id: `series-${index + 1}`,
    label: `Series ${index + 1}`,
    base: 40 + (index % 5) * 4,
    variance: 8 + (index % 3) * 2,
    tone: PANEL_TONES[index % PANEL_TONES.length],
    stroke: PANEL_PALETTE[index % PANEL_PALETTE.length]!,
  }));
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
    description: "CI benchmark fixture — 6 × 2000 pts @ 5 Hz",
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
    description: "10 panels × 10000 pts @ 10 Hz — stresses Recharts",
  },
};

export const FRAME_BUDGET_MS = 16;

export const ISOLATED_BENCH_WARMUP = 5;
export const ISOLATED_BENCH_UPDATES = 30;
export const ISOLATED_BENCH_SETTLE_MS = 250;

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
  const delta = (Math.random() - 0.5) * 2;
  return [...values.slice(1), Math.max(0, last + delta)];
}

export function shiftPanels(panels: LivePanelState[]): LivePanelState[] {
  return panels.map((panel) => ({
    ...panel,
    values: shiftSeries(panel.values),
  }));
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

function recordSample(
  samples: number[],
  elapsed: number,
  budgetMs: number,
  windowSize: number,
): { samples: number[]; overBudget: boolean; severeJank: boolean } {
  return {
    samples: [...samples, elapsed].slice(-windowSize),
    overBudget: elapsed > budgetMs,
    severeJank: elapsed > budgetMs * 2,
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

export type CiBenchReference = {
  fixtureId: string;
  environment: string;
  panels: number;
  points: number;
  axichartsP95Ms: number;
  rechartsP95Ms: number;
  echartsP95Ms?: number;
};

/** Published CI numbers from benchmarks/results/latest/browser-competitive.json */
const CI_BENCH_FIXTURES: CiBenchReference[] = [
  {
    fixtureId: "dashboard-6up",
    environment: "chromium-4x",
    panels: 6,
    points: 2000,
    axichartsP95Ms: 2.9,
    rechartsP95Ms: 54.3,
    echartsP95Ms: 26.5,
  },
];

export function lookupCiReference(
  panelCount: number,
  pointCount: number,
): CiBenchReference | undefined {
  return CI_BENCH_FIXTURES.find(
    (fixture) => fixture.panels === panelCount && fixture.points === pointCount,
  );
}

export type IsolatedBenchResult = {
  status: "pending" | "running" | "done";
  axiP95Ms: number;
  rechartsP95Ms: number;
  updates: number;
};

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
  axiLive: TimingMetrics;
  rechartsLive: TimingMetrics;
  isolatedBench: IsolatedBenchResult;
  activeLibrary: "axicharts" | "recharts";
  hz: number;
  effectiveRechartsHz: number;
  pointCount: number;
  panelCount: number;
  running: boolean;
  calibrating: boolean;
  rechartsThrottled: boolean;
  rechartsSkipRatio: number;
  toggle: () => void;
  rerunIsolatedBench: () => void;
};

function runIsolatedUpdates(
  warmup: number,
  updates: number,
  update: () => void,
): number {
  for (let index = 0; index < warmup; index++) {
    update();
  }

  const times: number[] = [];
  for (let index = 0; index < updates; index++) {
    const start = performance.now();
    flushSync(update);
    times.push(performance.now() - start);
  }

  times.sort((a, b) => a - b);
  return percentile(times, 0.95);
}

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
  const [calibrating, setCalibrating] = useState(true);
  const [panels, setPanels] = useState<LivePanelState[]>(() =>
    specs.map((spec) => createPanelState(spec, pointCount)),
  );
  const [rechartsPanels, setRechartsPanels] = useState<LivePanelState[]>(() =>
    specs.map((spec) => createPanelState(spec, pointCount)),
  );
  const [axiLive, setAxiLive] = useState<TimingMetrics>(createEmptyTimingMetrics);
  const [rechartsLive, setRechartsLive] = useState<TimingMetrics>(createEmptyTimingMetrics);
  const [isolatedBench, setIsolatedBench] = useState<IsolatedBenchResult>({
    status: "pending",
    axiP95Ms: 0,
    rechartsP95Ms: 0,
    updates: ISOLATED_BENCH_UPDATES,
  });
  const [activeLibrary, setActiveLibrary] = useState<"axicharts" | "recharts">("axicharts");
  const [rechartsSkipRatio, setRechartsSkipRatio] = useState(1);

  const panelsRef = useRef(panels);
  const rechartsPanelsRef = useRef(rechartsPanels);
  const tickRef = useRef(0);
  const rechartsSkipRef = useRef(1);
  const axiSamplesRef = useRef<number[]>([]);
  const axiCumulativeRef = useRef(0);
  const axiOverBudgetRef = useRef(0);
  const axiSevereRef = useRef(0);
  const rechartsSamplesRef = useRef<number[]>([]);
  const rechartsCumulativeRef = useRef(0);
  const rechartsOverBudgetRef = useRef(0);
  const rechartsSevereRef = useRef(0);
  const [isolatedGeneration, setIsolatedGeneration] = useState(0);

  panelsRef.current = panels;
  rechartsPanelsRef.current = rechartsPanels;

  const resetLiveMetrics = useCallback(() => {
    axiSamplesRef.current = [];
    axiCumulativeRef.current = 0;
    axiOverBudgetRef.current = 0;
    axiSevereRef.current = 0;
    rechartsSamplesRef.current = [];
    rechartsCumulativeRef.current = 0;
    rechartsOverBudgetRef.current = 0;
    rechartsSevereRef.current = 0;
    setAxiLive(createEmptyTimingMetrics());
    setRechartsLive(createEmptyTimingMetrics());
  }, []);

  const rerunIsolatedBench = useCallback(() => {
    setIsolatedGeneration((value) => value + 1);
  }, []);

  useEffect(() => {
    const seeded = specs.map((spec) => createPanelState(spec, pointCount));
    setPanels(seeded);
    setRechartsPanels(
      seeded.map((panel) => ({ ...panel, values: [...panel.values] })),
    );
    panelsRef.current = seeded;
    rechartsPanelsRef.current = seeded.map((panel) => ({
      ...panel,
      values: [...panel.values],
    }));
    tickRef.current = 0;
    rechartsSkipRef.current = 1;
    setRechartsSkipRatio(1);
    resetLiveMetrics();
    setIsolatedBench({
      status: "pending",
      axiP95Ms: 0,
      rechartsP95Ms: 0,
      updates: ISOLATED_BENCH_UPDATES,
    });
    rerunIsolatedBench();
  }, [pointCount, resetLiveMetrics, rerunIsolatedBench, specs]);

  useEffect(() => {
    let cancelled = false;

    const timer = window.setTimeout(() => {
      if (cancelled) return;

      setCalibrating(true);
      setIsolatedBench({
        status: "running",
        axiP95Ms: 0,
        rechartsP95Ms: 0,
        updates: ISOLATED_BENCH_UPDATES,
      });

      const axiP95Ms = runIsolatedUpdates(
        ISOLATED_BENCH_WARMUP,
        ISOLATED_BENCH_UPDATES,
        () => {
          const next = shiftPanels(panelsRef.current);
          panelsRef.current = next;
          setPanels(next);
        },
      );

      if (cancelled) return;

      const rechartsP95Ms = runIsolatedUpdates(
        ISOLATED_BENCH_WARMUP,
        ISOLATED_BENCH_UPDATES,
        () => {
          const next = shiftPanels(rechartsPanelsRef.current);
          rechartsPanelsRef.current = next;
          setRechartsPanels(next);
        },
      );

      if (cancelled) return;

      setIsolatedBench({
        status: "done",
        axiP95Ms,
        rechartsP95Ms,
        updates: ISOLATED_BENCH_UPDATES,
      });

      const synced = panelsRef.current.map((panel) => ({
        ...panel,
        values: [...panel.values],
      }));
      rechartsPanelsRef.current = synced;
      setRechartsPanels(synced);
      setCalibrating(false);
    }, ISOLATED_BENCH_SETTLE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [isolatedGeneration]);

  useEffect(() => {
    if (!running || calibrating) return;

    const id = window.setInterval(() => {
      tickRef.current += 1;
      const tick = tickRef.current;
      const updateAxi = tick % 2 === 1;

      const nextPanels = shiftPanels(panelsRef.current);
      panelsRef.current = nextPanels;

      const start = performance.now();
      flushSync(() => {
        if (updateAxi) {
          setActiveLibrary("axicharts");
          setPanels(nextPanels);
        } else {
          const skip = rechartsSkipRef.current;
          if (tick % (2 * skip) === 0) {
            setActiveLibrary("recharts");
            const nextRecharts = nextPanels.map((panel) => ({
              ...panel,
              values: [...panel.values],
            }));
            rechartsPanelsRef.current = nextRecharts;
            setRechartsPanels(nextRecharts);
          }
        }
      });
      const elapsed = performance.now() - start;

      if (updateAxi) {
        axiCumulativeRef.current += elapsed;
        const recorded = recordSample(
          axiSamplesRef.current,
          elapsed,
          FRAME_BUDGET_MS,
          60,
        );
        axiSamplesRef.current = recorded.samples;
        if (recorded.overBudget) axiOverBudgetRef.current += 1;
        if (recorded.severeJank) axiSevereRef.current += 1;
        setAxiLive(
          buildTimingMetrics(
            axiSamplesRef.current,
            axiCumulativeRef.current,
            axiOverBudgetRef.current,
            axiSevereRef.current,
          ),
        );
      } else if (tick % (2 * rechartsSkipRef.current) === 0) {
        rechartsCumulativeRef.current += elapsed;
        const recorded = recordSample(
          rechartsSamplesRef.current,
          elapsed,
          FRAME_BUDGET_MS,
          60,
        );
        rechartsSamplesRef.current = recorded.samples;
        if (recorded.overBudget) rechartsOverBudgetRef.current += 1;
        if (recorded.severeJank) rechartsSevereRef.current += 1;
        setRechartsLive(
          buildTimingMetrics(
            rechartsSamplesRef.current,
            rechartsCumulativeRef.current,
            rechartsOverBudgetRef.current,
            rechartsSevereRef.current,
          ),
        );

        if (autoThrottleRecharts && elapsed > FRAME_BUDGET_MS) {
          const nextSkip = Math.min(8, rechartsSkipRef.current * 2);
          if (nextSkip !== rechartsSkipRef.current) {
            rechartsSkipRef.current = nextSkip;
            setRechartsSkipRatio(nextSkip);
          }
        } else if (
          autoThrottleRecharts &&
          elapsed < FRAME_BUDGET_MS * 0.75 &&
          rechartsSkipRef.current > 1
        ) {
          const nextSkip = Math.max(1, Math.floor(rechartsSkipRef.current / 2));
          rechartsSkipRef.current = nextSkip;
          setRechartsSkipRatio(nextSkip);
        }
      }
    }, 1000 / hz);

    return () => window.clearInterval(id);
  }, [autoThrottleRecharts, calibrating, hz, running]);

  const effectiveRechartsHz = hz / (2 * rechartsSkipRatio);

  return useMemo(
    () => ({
      panels,
      rechartsPanels,
      axiLive,
      rechartsLive,
      isolatedBench,
      activeLibrary,
      hz,
      effectiveRechartsHz,
      pointCount,
      panelCount: specs.length,
      running,
      calibrating,
      rechartsThrottled: rechartsSkipRatio > 1,
      rechartsSkipRatio,
      toggle: () => setRunning((value) => !value),
      rerunIsolatedBench,
    }),
    [
      panels,
      rechartsPanels,
      axiLive,
      rechartsLive,
      isolatedBench,
      activeLibrary,
      hz,
      effectiveRechartsHz,
      pointCount,
      specs.length,
      running,
      calibrating,
      rechartsSkipRatio,
      rerunIsolatedBench,
    ],
  );
}

export function formatSeriesValue(value: number): string {
  return value.toFixed(1);
}

export function formatMultiplier(ratio: number): string {
  if (!Number.isFinite(ratio) || ratio <= 0) return "—";
  return `${ratio.toFixed(1)}×`;
}

export function isStruggling(metrics: TimingMetrics, budgetMs = FRAME_BUDGET_MS): boolean {
  return metrics.sampleCount >= 5 && metrics.p95Ms > budgetMs;
}
