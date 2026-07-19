import { describe, expect, it } from "vitest";
import { validateRuntimeSpecRaw } from "./runtimeValidation";

describe("validateRuntimeSpecRaw panels layout", () => {
  it("accepts tabular panels runtime spec", () => {
    const result = validateRuntimeSpecRaw({
      layout: "panels",
      panels: {
        title: "Ledger",
        vertical: "ledger",
        sourceCsv: "a,b\n1,2",
        kpis: [{ panel: { type: "kpi", title: "KPI", marks: [] }, rows: [{ a: 1 }] }],
        charts: [{ panel: { type: "cartesian", title: "Chart", marks: [] }, rows: [{ a: 1 }] }],
      },
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.spec.layout).toBe("panels");
  });
});
