import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
    // The first test does a real ECharts canvas render; leave headroom for
    // CPU contention under `turbo run test` (all packages in parallel).
    testTimeout: 15_000,
  },
});
