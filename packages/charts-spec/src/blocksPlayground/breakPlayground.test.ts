import { describe, expect, it } from "vitest";
import { createCartesianPanel } from "../createCartesianPanel";
import {
  evaluatePlaygroundSpec,
  formatPlaygroundEject,
  parsePlaygroundData,
} from "./evaluate";

const ROWS = [
  { week: "W1", revenue: 42, target: 40 },
  { week: "W2", revenue: 48, target: 44 },
];

describe("blocksPlayground adversarial cases", () => {
  it("surfaces DUPLICATE_OVERLAY_CHANNEL before normalize merges overlays", () => {
    const spec = {
      type: "cartesian",
      encoding: { x: { field: "week" } },
      marks: [
        { type: "bar", field: "revenue" },
        { type: "rule", value: 50, label: "marks rule" },
      ],
      props: {
        referenceLines: [{ value: 60, label: "props rule" }],
      },
    };
    const result = evaluatePlaygroundSpec(JSON.stringify(spec), ROWS);
    expect(result.canRender).toBe(true);
    expect(
      result.warnings.some((w) => w.code === "DUPLICATE_OVERLAY_CHANNEL"),
    ).toBe(true);
  });

  it("flags nonsense intent with needsReview on createCartesianPanel", () => {
    const result = createCartesianPanel({
      intent: "make me a sandwich",
      fields: ["week", "revenue", "target"],
    });
    expect(result.needsReview).toBe(true);
    expect(result.reviewReason).toBe("vague_intent");
    expect(result.matchedRules).toEqual([]);
    expect(result.panel.marks).toEqual([]);
    expect(result.panel.props?.plannerMeta).toMatchObject({
      needsReview: true,
      reviewReason: "vague_intent",
      intent: "make me a sandwich",
    });
  });

  it("formatPlaygroundEject prepends rows const and uses cartesian import", () => {
    const code = `import { CartesianChart } from "@axicharts/charts";
<CartesianChart data={rows} />`;
    const formatted = formatPlaygroundEject(code, ROWS);
    expect(formatted).toMatch(/^const rows = \[/);
    expect(formatted).toContain('@axicharts/charts/cartesian"');
    expect(formatted).not.toContain('from "@axicharts/charts";');
  });

  it("parsePlaygroundData rejects invalid JSON and non-array data", () => {
    expect(parsePlaygroundData("{ not json").ok).toBe(false);
    if (!parsePlaygroundData("{ not json").ok) {
      expect(parsePlaygroundData("{ not json").error).toBeTruthy();
    }
    const objectResult = parsePlaygroundData('{"week":"W1"}');
    expect(objectResult.ok).toBe(false);
    if (!objectResult.ok) {
      expect(objectResult.error).toContain("array");
    }
    const valid = parsePlaygroundData(JSON.stringify(ROWS));
    expect(valid.ok).toBe(true);
    if (valid.ok) {
      expect(valid.rows).toEqual(ROWS);
    }
  });
});
