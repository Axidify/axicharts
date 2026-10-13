import { describe, expect, it } from "vitest";

// The dynamic imports below transform and evaluate the whole server/tool module
// graph (~0.3s alone). Under `turbo run test` with every package in parallel that
// can exceed vitest's 5s default, so give this cold-import test more headroom.
const COLD_IMPORT_TIMEOUT_MS = 30_000;

describe("charts-mcp startup", () => {
  it(
    "loads server modules without React / uPlot CSS imports",
    async () => {
      await expect(import("./server")).resolves.toBeDefined();
      await expect(import("./tools")).resolves.toBeDefined();
    },
    COLD_IMPORT_TIMEOUT_MS,
  );
});
