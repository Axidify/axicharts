import { describe, expect, it } from "vitest";
import { createCartesianPanel, reviseCartesianPanel } from "./createCartesianPanel";
import { validateCartesianSpec } from "./cartesianValidation";

const ROWS = [
  { week: "W1", revenue: 42, target: 40 },
  { week: "W2", revenue: 48, target: 44 },
];

describe("createCartesianPanel", () => {
  it("builds bar + line + rule + band from finance intent", () => {
    const { panel, needsReview, matchedRules } = createCartesianPanel({
      intent: "Weekly revenue bars with target line, quota at 50, and healthy band 44–52",
      fields: ["week", "revenue", "target"],
    });
    expect(panel.type).toBe("cartesian");
    expect(panel.marks?.some((mark) => mark.type === "bar")).toBe(true);
    expect(panel.marks?.some((mark) => mark.type === "line")).toBe(true);
    expect(panel.marks?.some((mark) => mark.type === "rule" && mark.value === 50)).toBe(
      true,
    );
    expect(
      panel.marks?.some(
        (mark) => mark.type === "band" && mark.min === 44 && mark.max === 52,
      ),
    ).toBe(true);
    expect(needsReview).toBe(false);
    expect(matchedRules).toEqual(
      expect.arrayContaining(["bar", "line", "rule-slo", "band-healthy"]),
    );
    const validation = validateCartesianSpec(panel, { rows: ROWS });
    expect(validation.ok).toBe(true);
  });

  it("builds ops SLO panel with band under threshold", () => {
    const { panel, needsReview } = createCartesianPanel({
      intent: "p95 latency trend with healthy band under 150 and SLO at 200",
      fields: ["hour", "latency_ms"],
      mode: "live",
    });
    expect(needsReview).toBe(false);
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

  it("does not invent a bar from bare revenue mention", () => {
    const { panel, needsReview, matchedRules } = createCartesianPanel({
      intent: "show revenue over time",
      fields: ["week", "revenue", "target"],
    });
    expect(needsReview).toBe(false);
    expect(matchedRules).toEqual(["line"]);
    expect(panel.marks?.map((mark) => mark.type)).toEqual(["line"]);
  });

  it("flags overlay-only intents without data marks", () => {
    const { panel, needsReview, reviewReason } = createCartesianPanel({
      intent: "quota at 50 and healthy band 44-52",
      fields: ["week", "revenue", "target"],
    });
    expect(needsReview).toBe(true);
    expect(reviewReason).toBe("no_data_mark");
    expect(panel.marks?.every((mark) => mark.type === "rule" || mark.type === "band")).toBe(
      true,
    );
    const validation = validateCartesianSpec(panel, { rows: ROWS });
    expect(validation.ok).toBe(false);
    if (!validation.ok) {
      expect(validation.errors.some((error) => error.code === "MISSING_DATA_MARK")).toBe(
        true,
      );
    }
  });

  it("flags vague intents without inventing a fallback line", () => {
    const { panel, needsReview, reviewReason, matchedRules } = createCartesianPanel({
      intent: "make me a sandwich",
      fields: ["week", "revenue"],
    });
    expect(needsReview).toBe(true);
    expect(reviewReason).toBe("vague_intent");
    expect(matchedRules).toEqual([]);
    expect(panel.marks).toEqual([]);
  });

  it("flags vague filler even when numeric fields exist", () => {
    const { needsReview, reviewReason, matchedRules } = createCartesianPanel({
      intent: "show me something cool about the numbers",
      fields: ["week", "revenue", "target"],
    });
    expect(needsReview).toBe(true);
    expect(reviewReason).toBe("vague_intent");
    expect(matchedRules).toEqual([]);
  });
});

describe("reviseCartesianPanel", () => {
  it("appends rule and line marks across turns", () => {
    const { panel: barPanel } = createCartesianPanel({
      intent: "weekly revenue bars",
      fields: ["week", "revenue", "target"],
    });

    const { panel, matchedRules } = reviseCartesianPanel({
      spec: barPanel,
      instruction: "add target line and quota at 50",
      dataProfile: { fields: ["week", "revenue", "target"] },
    });

    expect(panel.type).toBe("cartesian");
    expect(matchedRules).toEqual(expect.arrayContaining(["line", "rule-slo"]));
    expect(panel.marks?.some((mark) => mark.type === "line" && mark.field === "target")).toBe(
      true,
    );
    expect(panel.marks?.some((mark) => mark.type === "rule" && mark.value === 50)).toBe(true);
  });

  it("normalizes legacy line spec before revising", () => {
    const { panel, matchedRules } = reviseCartesianPanel({
      spec: {
        specVersion: 1,
        type: "line",
        encoding: {
          x: { field: "week" },
          y: { field: "revenue" },
        },
      },
      instruction: "add healthy band 44-52",
      dataProfile: { fields: ["week", "revenue"] },
    });

    expect(panel.type).toBe("cartesian");
    expect(matchedRules).toContain("band-healthy");
    expect(
      panel.marks?.some(
        (mark) => mark.type === "band" && mark.min === 44 && mark.max === 52,
      ),
    ).toBe(true);
  });
});
