import { describe, expect, it } from "vitest";
import { compilePanel } from "../compilePanel";
import { ejectPanel } from "../eject";
import { validatePanel } from "../validatePanel";
import { DISTRIBUTION_PLAYGROUND_PRESETS } from "./presets";

describe("distribution playground presets", () => {
  for (const preset of DISTRIBUTION_PLAYGROUND_PRESETS) {
    it(`${preset.id} validates, compiles, and ejects`, () => {
      const validation = validatePanel(preset.panel, { rows: preset.rows, strict: true });
      expect(validation.ok, preset.id).toBe(true);

      const compiled = compilePanel(preset.panel, preset.rows);
      expect(compiled).toBeTruthy();

      const jsx = ejectPanel(preset.panel, "rows", { style: "composable" });
      expect(jsx).toContain("@axicharts/charts/distribution");
      expect(jsx).toContain("<Pie ");
    });
  }
});
