import { describe, expect, it } from "vitest";
import { createCartesianPanel } from "./createCartesianPanel";
import { validateCartesianSpec } from "./cartesianValidation";

const ROWS = [
  { week: "W1", revenue: 42, target: 40 },
  { week: "W2", revenue: 48, target: 44 },
];

describe("createCartesianPanel", () => {
  it("builds bar + line + rule from finance intent", () => {
    const { panel, needsReview, matchedRules } = createCartesianPanel({
      intent: "Weekly revenue bars with target line and quota at 50",
      fields: ["week", "revenue", "target"],
    });
    expect(panel.type).toBe("cartesian");
    expect(panel.marks?.some((mark) => mark.type === "bar")).toBe(true);
    expect(panel.marks?.some((mark) => mark.type === "line")).toBe(true);
    expect(panel.marks?.some((mark) => mark.type === "rule" && mark.value === 50)).toBe(
      true,
    );
    expect(needsReview).toBe(false);
    expect(matchedRules).toEqual(expect.arrayContaining(["bar", "line", "rule-slo"]));
    const validation = validateCartesianSpec(panel, { rows: ROWS });
    expect(validation.ok).toBe(true);
  });

  it("builds ops SLO panel with band", () => {
    const { panel } = createCartesianPanel({
      intent: "p95 latency trend with healthy band 0-150 and SLO at 200",
      fields: ["hour", "latency_ms"],
      mode: "live",
    });
    expect(panel.marks?.some((mark) => mark.type === "line")).toBe(true);
    expect(panel.marks?.some((mark) => mark.type === "rule" && mark.value === 200)).toBe(
      true,
    );
    expect(
      panel.marks?.some(
        (mark) => mark.type === "band" && mark.min === 0 && mark.max === 150,
      ),
    ).toBe(true);
  });

  it("sets needsReview for nonsense intent", () => {
    const { needsReview, matchedRules } = createCartesianPanel({
      intent: "make me a sandwich",
      fields: ["week", "revenue"],
    });
    expect(needsReview).toBe(true);
    expect(matchedRules).toEqual(["fallback-line"]);
  });
});
