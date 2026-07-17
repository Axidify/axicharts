import { describe, expect, it } from "vitest";
import { loadFixture, type DashboardFixture } from "./bench/fixtures";
import { recordBench } from "./bench/report";
import { measureUpdateP95 } from "./bench/uplotBench";

const fixture = loadFixture<DashboardFixture>("dashboard-6up");

describe("live panel perf", () => {
  it(`keeps ${fixture.panels}-panel setData p95 under ${fixture.frameBudgetMs}ms`, async () => {
    const p95 = await measureUpdateP95({
      panelCount: fixture.panels,
      pointCount: fixture.pointsPerPanel,
      updateCount: fixture.updates,
    });

    recordBench({
      id: fixture.id,
      metric: "frame_p95",
      points: fixture.pointsPerPanel,
      panels: fixture.panels,
      series: 1,
      updates: fixture.updates,
      valueMs: p95,
      budgetMs: fixture.frameBudgetMs,
      passed: p95 < fixture.frameBudgetMs,
      environment: "node-happy-dom",
    });

    expect(p95).toBeLessThan(fixture.frameBudgetMs);
  });
});
