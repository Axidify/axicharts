import { describe, expect, it } from "vitest";
import { byokBodySchema, tabularInputSchema } from "./schemas";

describe("orchestrator request schemas", () => {
  it("requires csv or rows for plan/chat body", () => {
    expect(tabularInputSchema.safeParse({ persona: "manager" }).success).toBe(false);
    expect(tabularInputSchema.safeParse({ csv: "a,b\n1,2" }).success).toBe(true);
    expect(tabularInputSchema.safeParse({ rows: [{ a: 1 }] }).success).toBe(true);
  });

  it("rejects invalid persona", () => {
    expect(tabularInputSchema.safeParse({ csv: "a\n1", persona: "ceo" }).success).toBe(false);
  });

  it("requires apiKey for byok", () => {
    expect(byokBodySchema.safeParse({}).success).toBe(false);
    expect(byokBodySchema.safeParse({ apiKey: "sk-test" }).success).toBe(true);
  });
});
