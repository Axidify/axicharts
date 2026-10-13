import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    // Warms jsdom's native canvas binding outside the per-test timeout.
    setupFiles: ["./vitest.setup.ts"],
    // Headroom for CPU contention under `turbo run test` (all packages in
    // parallel); tests take ~1s alone.
    testTimeout: 15_000,
  },
});
