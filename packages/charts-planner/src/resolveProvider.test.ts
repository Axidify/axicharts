import { describe, expect, it } from "vitest";
import { resolvePlannerProvider } from "./resolveProvider";

describe("resolvePlannerProvider", () => {
  it("returns undefined in rules mode", () => {
    expect(resolvePlannerProvider("rules", { OPENAI_API_KEY: "sk-test" })).toBeUndefined();
  });

  it("auto-wires openai when API key is present", () => {
    const provider = resolvePlannerProvider("auto", { OPENAI_API_KEY: "sk-test" });
    expect(provider?.id).toBe("openai");
  });

  it("throws when openai mode is requested without credentials", () => {
    expect(() => resolvePlannerProvider("openai", {})).toThrow(/OPENAI_API_KEY/);
  });
});
