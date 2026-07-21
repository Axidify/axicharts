import { describe, expect, it } from "vitest";
import { isCompactTile } from "./themeBridge";

describe("radar compact posture", () => {
  it("treats 360×280 as a compact dashboard tile", () => {
    expect(isCompactTile(360, 280)).toBe(true);
    expect(isCompactTile(480, 360)).toBe(false);
  });
});
