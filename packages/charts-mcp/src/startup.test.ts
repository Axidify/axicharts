import { describe, expect, it } from "vitest";

describe("charts-mcp startup", () => {
  it("loads server modules without React / uPlot CSS imports", async () => {
    await expect(import("./server")).resolves.toBeDefined();
    await expect(import("./tools")).resolves.toBeDefined();
  });
});
