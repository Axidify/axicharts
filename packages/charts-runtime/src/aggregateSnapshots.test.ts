import { describe, expect, it } from "vitest";
import { mergeDashboardData } from "./aggregateSnapshots";

describe("mergeDashboardData", () => {
  it("preserves seed rows when incoming snapshot is empty", () => {
    const merged = mergeDashboardData(
      { rows: [{ week: "Mon", cpu: 1 }] },
      {},
    );
    expect(merged.rows).toEqual([{ week: "Mon", cpu: 1 }]);
  });

  it("prefers incoming rows when present", () => {
    const merged = mergeDashboardData(
      { rows: [{ week: "Mon", cpu: 1 }] },
      { rows: [{ week: "Tue", cpu: 2 }] },
    );
    expect(merged.rows).toEqual([{ week: "Tue", cpu: 2 }]);
  });
});
