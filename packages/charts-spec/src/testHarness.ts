/**
 * Guardrails for jsdom compile tests — fail fast when vitest.setup.ts polyfills are missing.
 */
export function assertChartsSpecTestHarness(): void {
  if (typeof ResizeObserver === "undefined") {
    throw new Error(
      "ResizeObserver is not defined. charts-spec tests require vitest.setup.ts so ChartContainer can measure layout.",
    );
  }

  if (typeof HTMLCanvasElement.prototype.getContext !== "function") {
    throw new Error(
      "HTMLCanvasElement.getContext is not polyfilled. charts-spec tests require vitest.setup.ts (@napi-rs/canvas).",
    );
  }
}
