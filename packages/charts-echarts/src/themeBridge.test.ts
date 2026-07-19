import { describe, expect, it } from "vitest";
import { cleanTheme } from "@axicharts/charts-theme";
import { gridOptions, isCompactTile } from "./themeBridge";

describe("themeBridge", () => {
  it("detects compact dashboard tiles", () => {
    expect(isCompactTile(360, 280)).toBe(true);
    expect(isCompactTile(400, 240)).toBe(false);
    expect(isCompactTile(500, 180)).toBe(true);
  });

  it("tightens grid margins in compact mode", () => {
    const regular = gridOptions(cleanTheme, false);
    const compact = gridOptions(cleanTheme, true);

    expect(compact.left).toBeLessThan(regular.left);
    expect(compact.top).toBeLessThan(regular.top);
    expect(compact.bottom).toBeLessThan(regular.bottom);
  });
});
