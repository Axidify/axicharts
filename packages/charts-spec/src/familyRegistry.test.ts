import { afterEach, describe, expect, it } from "vitest";
import {
  clearChartFamilies,
  getChartFamily,
  listChartFamilies,
  registerChartFamily,
  resolveRegisteredFamily,
} from "./familyRegistry";
import { resetChartFamilyRegistry, registerBuiltinChartFamilies } from "./registerBuiltinChartFamilies";
import { validatePanel } from "./validatePanel";

afterEach(() => {
  resetChartFamilyRegistry();
});

describe("familyRegistry (B6)", () => {
  it("registers built-in agent families", () => {
    registerBuiltinChartFamilies();
    expect(listChartFamilies().map((entry) => entry.family).sort()).toEqual([
      "cartesian",
      "distribution",
      "matrix",
    ]);
    expect(getChartFamily("cartesian")?.panelTypes).toContain("cartesian");
  });

  it("routes validatePanel through a third-party registration", () => {
    registerChartFamily({
      family: "demo-plugin",
      panelTypes: ["demo-panel"],
      coordinateSystem: "none",
      markCatalog: [{ mark: "value", role: "data", required: ["field"] }],
      validate: (spec) => ({
        ok: true,
        family: "demo-plugin",
        spec,
        warnings: [],
      }),
    });

    const resolved = resolveRegisteredFamily({ type: "demo-panel" });
    expect(resolved?.family).toBe("demo-plugin");

    const result = validatePanel({ type: "demo-panel" }, { strict: true });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.family).toBe("demo-plugin");
    }
  });

  it("rejects duplicate panel type registration", () => {
    registerChartFamily({
      family: "one",
      panelTypes: ["shared-type"],
      coordinateSystem: "none",
      markCatalog: [],
      validate: () => ({
        ok: true,
        family: "one",
        spec: { type: "shared-type" },
        warnings: [],
      }),
    });

    expect(() =>
      registerChartFamily({
        family: "two",
        panelTypes: ["shared-type"],
        coordinateSystem: "none",
        markCatalog: [],
        validate: () => ({
          ok: true,
          family: "two",
          spec: { type: "shared-type" },
          warnings: [],
        }),
      }),
    ).toThrow(/already registered/);
  });
});
