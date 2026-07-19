import { describe, expect, it } from "vitest";
import {
  dataColumnsChanged,
  dataFieldSignature,
  plannerReviewMessage,
} from "./playgroundReview";

describe("playgroundReview", () => {
  it("builds stable data field signatures", () => {
    const rows = [
      { week: "W1", revenue: 1, target: 2 },
      { week: "W2", revenue: 3, target: 4 },
    ];
    expect(dataFieldSignature(rows)).toBe("revenue\0target\0week");
    expect(dataFieldSignature([{ hour: "00", latency_ms: 1 }])).toBe("hour\0latency_ms");
  });

  it("detects column set changes but not value-only edits", () => {
    const finance = dataFieldSignature([{ week: "W1", revenue: 1 }]);
    const financeUpdated = dataFieldSignature([{ week: "W2", revenue: 9 }]);
    const ops = dataFieldSignature([{ hour: "00", latency_ms: 1 }]);

    expect(dataColumnsChanged(finance, financeUpdated)).toBe(false);
    expect(dataColumnsChanged(finance, ops)).toBe(true);
    expect(dataColumnsChanged("", ops)).toBe(false);
  });

  it("describes planner review reasons", () => {
    expect(plannerReviewMessage("vague_intent")).toContain("too vague");
    expect(plannerReviewMessage("no_data_mark")).toContain("overlays only");
    expect(plannerReviewMessage(null)).toContain("needs review");
  });
});
