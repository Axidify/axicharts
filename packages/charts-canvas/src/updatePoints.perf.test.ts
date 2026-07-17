import { describe, expect, it } from "vitest";
import { loadFixture, type PointFixture } from "./bench/fixtures";
import { recordBench } from "./bench/report";
import { measureUpdateP95 } from "./bench/uplotBench";

const UPDATE_COUNT = 30;

const pointFixtures = ["small", "medium", "large", "multi-series"].map(
  (id) => loadFixture<PointFixture>(id),
);

describe("single-panel update perf", () => {
  for (const fixture of pointFixtures) {
    it(`keeps setData p95 under ${fixture.updateBudgetMs}ms @ ${fixture.points}pts × ${fixture.series} series`, async () => {
      const p95 = await measureUpdateP95({
        panelCount: 1,
        pointCount: fixture.points,
        seriesCount: fixture.series,
        updateCount: UPDATE_COUNT,
      });

      recordBench({
        id: fixture.id,
        metric: "update_p95",
        points: fixture.points,
        panels: 1,
        series: fixture.series,
        updates: UPDATE_COUNT,
        valueMs: p95,
        budgetMs: fixture.updateBudgetMs,
        passed: p95 < fixture.updateBudgetMs,
        environment: "node-happy-dom",
      });

      expect(p95).toBeLessThan(fixture.updateBudgetMs);
    });
  }
});
