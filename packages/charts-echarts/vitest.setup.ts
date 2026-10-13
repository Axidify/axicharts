// Warm jsdom's lazy node-canvas binding before any test runs.
//
// jsdom only `require`s the native `canvas` addon on the first
// `HTMLCanvasElement#getContext()` call. `echartsColor` (used by themeBridge,
// i.e. nearly every adapter render) hits that path, so the first test in each
// file paid ~0.5s cold — several seconds when turbo runs every package in
// parallel, tripping vitest's 5s default testTimeout. Setup files run outside
// the per-test timeout, so pay the cost here instead.
if (typeof document !== "undefined") {
  document.createElement("canvas").getContext("2d");
}
