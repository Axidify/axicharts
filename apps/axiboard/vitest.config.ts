import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["server/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@axicharts/charts-mcp": new URL(
        "../../packages/charts-mcp/src/index.ts",
        import.meta.url,
      ).pathname,
    },
  },
});
