import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.ts"],
    exclude: ["src/**/*.perf.test.ts"],
    passWithNoTests: true,
  },
});
