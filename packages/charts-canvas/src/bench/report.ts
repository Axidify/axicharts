import fs from "node:fs";
import path from "node:path";

export interface BenchRecord {
  id: string;
  metric: "update_p95" | "frame_p95";
  points: number;
  panels: number;
  series: number;
  updates: number;
  valueMs: number;
  budgetMs: number;
  passed: boolean;
  environment: "node-happy-dom";
}

function perfResultsPath(): string | null {
  if (process.env.BENCHMARK_COLLECT !== "1") return null;
  const dir = process.env.BENCHMARK_RESULTS_DIR;
  if (!dir) return null;
  return path.join(dir, "perf.json");
}

export function recordBench(row: BenchRecord): void {
  const filePath = perfResultsPath();
  if (!filePath) return;

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const existing: BenchRecord[] = fs.existsSync(filePath)
    ? (JSON.parse(fs.readFileSync(filePath, "utf8")) as BenchRecord[])
    : [];
  existing.push(row);
  fs.writeFileSync(filePath, `${JSON.stringify(existing, null, 2)}\n`);
}
