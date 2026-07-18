import { describe, expect, it } from "vitest";
import { BLOCKS_PLAYGROUND_PRESETS } from "./presets";
import { evaluatePlaygroundSpec } from "./evaluate";

describe("blocksPlayground evaluate", () => {
  it("validates and ejects all presets", () => {
    for (const preset of BLOCKS_PLAYGROUND_PRESETS) {
      const json = JSON.stringify(preset.panel, null, 2);
      const result = evaluatePlaygroundSpec(json, preset.rows);
      expect(result.parseError, preset.id).toBeUndefined();
      expect(result.errors, preset.id).toEqual([]);
      expect(result.canRender, preset.id).toBe(true);
      expect(result.ejected, preset.id).toContain("CartesianChart");
      expect(result.ejected, preset.id).toContain("const rows =");
      expect(result.ejected, preset.id).toContain("@axicharts/charts/cartesian");
    }
  });

  it("surfaces UNKNOWN_FIELD with suggestion", () => {
    const preset = BLOCKS_PLAYGROUND_PRESETS[0]!;
    const bad = {
      ...preset.panel,
      marks: [{ mark: "bar", field: "revnue" }],
    };
    const result = evaluatePlaygroundSpec(JSON.stringify(bad), preset.rows);
    expect(result.canRender).toBe(false);
    expect(result.errors.some((e) => e.code === "UNKNOWN_FIELD")).toBe(true);
  });

  it("rejects invalid JSON", () => {
    const result = evaluatePlaygroundSpec("{ not json", []);
    expect(result.parseError).toBeDefined();
    expect(result.canRender).toBe(false);
  });
});
