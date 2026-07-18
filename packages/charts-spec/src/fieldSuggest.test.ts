import { describe, expect, it } from "vitest";
import { suggestField } from "./fieldSuggest";

describe("suggestField", () => {
  it("suggests close field names", () => {
    expect(suggestField("revnue", ["week", "revenue", "target"])).toBe(
      "revenue",
    );
  });
});
