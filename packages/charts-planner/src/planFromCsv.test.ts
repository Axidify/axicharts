import { describe, expect, it } from "vitest";
import { planFromCsv } from "./planFromCsv";

const SAMPLE_CSV = `time,cpu,memory,errors,p95
08:00,22,55,1,42
09:00,28,58,2,38
10:00,31,60,5,55`;

describe("planFromCsv", () => {
  it("returns a dashboard plan with panels from CSV text", () => {
    const plan = planFromCsv(SAMPLE_CSV, {
      intent: "Static CSV snapshot batch report",
    });
    expect(plan.feed).toBe("static");
    expect(plan.panels.length).toBeGreaterThan(0);
  });
});
