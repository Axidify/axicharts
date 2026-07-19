import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import { axichartsMonorepoAliases } from "../../scripts/vite-monorepo-aliases";

const appRoot = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(appRoot, "../..");

export default defineConfig({
  test: {
    include: ["server/**/*.test.ts", "src/**/*.test.ts"],
  },
  resolve: {
    alias: [
      ...(axichartsMonorepoAliases(repoRoot) as Array<{ find: string | RegExp; replacement: string }>),
      {
        find: "@axicharts/charts-mcp",
        replacement: path.resolve(repoRoot, "packages/charts-mcp/src/index.ts"),
      },
    ],
  },
});
