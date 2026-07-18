import { describe, expect, it } from "vitest";
import { echartsColor } from "./echartsColor";

describe("echartsColor", () => {
  it("passes through hex colors", () => {
    expect(echartsColor("#2563eb")).toBe("#2563eb");
  });

  it("normalizes modern hsl tokens for ECharts", () => {
    const green = echartsColor("hsl(142 71% 36%)");
    const purple = echartsColor("hsl(262 83% 58%)");
    expect(green).not.toBe("hsl(142 71% 36%)");
    expect(purple).not.toBe("hsl(262 83% 58%)");
    expect(green).toMatch(/^(#[0-9a-f]{6}|hsl\()/i);
    expect(purple).toMatch(/^(#[0-9a-f]{6}|hsl\()/i);
  });
});
