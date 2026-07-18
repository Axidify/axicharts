import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@axicharts/charts-runtime": path.resolve(root, "packages/charts-runtime/src"),
      "@axicharts/charts-spec": path.resolve(root, "packages/charts-spec/src"),
      "@axicharts/charts-planner": path.resolve(root, "packages/charts-planner/src"),
      "@axicharts/charts": path.resolve(root, "packages/charts/src"),
      "@axicharts/charts-theme": path.resolve(root, "packages/charts-theme/src"),
      "@axicharts/charts-canvas": path.resolve(root, "packages/charts-canvas/src"),
      "@axicharts/charts-echarts": path.resolve(root, "packages/charts-echarts/src"),
      "@axicharts/charts-core": path.resolve(root, "packages/charts-core/src"),
      "@axicharts/charts-tank": path.resolve(root, "packages/charts-tank/src"),
      "@axicharts/charts-geo": path.resolve(root, "packages/charts-geo/src"),
      "@axicharts/charts-andon": path.resolve(root, "packages/charts-andon/src"),
      "@axicharts/charts-sankey": path.resolve(root, "packages/charts-sankey/src"),
      "@axicharts/charts-gantt": path.resolve(root, "packages/charts-gantt/src"),
      "echarts/lib/echarts": path.resolve(
        root,
        "packages/charts-echarts/src/echartsRuntime.ts",
      ),
    },
  },
  server: {
    port: 3000,
  },
});
