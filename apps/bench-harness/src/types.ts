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

declare global {
  interface Window {
    __benchReady?: boolean;
    __runUpdateBench?: (updates: number) => BenchResult;
  }
}

export {};
