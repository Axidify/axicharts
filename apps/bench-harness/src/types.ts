export type BenchLib = "axicharts" | "recharts" | "echarts";

export type BenchParams = {
  lib: BenchLib;
  fixture: string;
  panels: number;
  points?: number;
};

export type BenchResult = {
  p95Ms: number;
  updates: number;
};

export type SoakBenchResult = {
  p95Ms: number;
  updates: number;
  durationMs: number;
  hz: number;
};

export type LeakBenchResult = {
  cycles: number;
  leftoverUplot: number;
  heapDeltaMb: number;
  passed: boolean;
};

declare global {
  interface Window {
    __benchReady?: boolean;
    __runUpdateBench?: (updates: number) => BenchResult;
    __runSoakBench?: (options: {
      durationMs: number;
      hz: number;
    }) => Promise<SoakBenchResult>;
    __runLeakCheck?: (cycles?: number) => LeakBenchResult;
  }
}

export {};
