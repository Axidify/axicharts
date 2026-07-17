import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const fixturesDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../../../benchmarks/fixtures",
);

export interface PointFixture {
  id: string;
  points: number;
  series: number;
  updateBudgetMs: number;
  firstRenderBudgetMs: number;
}

export interface DashboardFixture {
  id: string;
  panels: number;
  pointsPerPanel: number;
  updates: number;
  frameBudgetMs: number;
}

export function loadFixture<T extends { id: string }>(id: string): T {
  return JSON.parse(
    readFileSync(join(fixturesDir, `${id}.json`), "utf8"),
  ) as T;
}
