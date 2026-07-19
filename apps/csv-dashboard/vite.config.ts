import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@axicharts/charts-planner": path.resolve(root, "packages/charts-planner/src"),
      "@axicharts/charts-spec/cartesian": path.resolve(
        root,
        "packages/charts-spec/src/entry/cartesian.ts",
      ),
      "@axicharts/charts-spec": path.resolve(root, "packages/charts-spec/src"),
      "@axicharts/charts": path.resolve(root, "packages/charts/src"),
      "@axicharts/charts-theme": path.resolve(root, "packages/charts-theme/src"),
      "@axicharts/charts-canvas": path.resolve(root, "packages/charts-canvas/src"),
      "@axicharts/charts-echarts": path.resolve(root, "packages/charts-echarts/src"),
      "@axicharts/charts-core": path.resolve(root, "packages/charts-core/src"),
    },
  },
  server: {
    port: 3002,
  },
});
