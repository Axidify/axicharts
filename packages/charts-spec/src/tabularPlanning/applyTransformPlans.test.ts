import { describe, expect, it } from "vitest";
import { parseTabular } from "../parseTabular";
import { applyTransformPlans } from "./applyTransformPlans";

const INVENTORY_CSV = `sku,name,stock,reorder_level,category
A1,Widget,4,10,Parts
B2,Gadget,12,8,Parts
C3,Bolt,2,5,Hardware
D4,Nut,20,15,Hardware`;

describe("applyTransformPlans (C178)", () => {
  it("compiles generic follow-up intent via recipesFromFollowUp", () => {
    const rows = parseTabular(INVENTORY_CSV);
    const applied = applyTransformPlans(
      rows,
      [{ intent: "breakdown by category" }],
      { vertical: "generic" },
    );

    expect(applied).toHaveLength(1);
    expect(applied[0]?.ok).toBe(true);
    expect(applied[0]?.panel.type).toBe("cartesian");
    expect(applied[0]?.rows.length).toBeGreaterThan(0);
  });

  it("returns validation errors for unknown intents", () => {
    const rows = parseTabular(INVENTORY_CSV);
    const applied = applyTransformPlans(
      rows,
      [{ intent: "totally unknown analytic phrase xyz" }],
      { vertical: "generic" },
    );
    expect(applied[0]?.ok).toBe(false);
    expect(applied[0]?.issues.some((issue) => issue.code === "NO_CATALOG_MATCH")).toBe(true);
  });
});
