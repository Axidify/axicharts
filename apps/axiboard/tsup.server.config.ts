import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["server/index.ts"],
  format: ["esm"],
  outDir: "dist-server",
  clean: true,
  external: [
    "@axicharts/charts-spec/planning",
    "@axicharts/charts-planner/tabular",
    "@axicharts/charts-runtime/workspace",
    "react",
    "react-dom",
    "echarts",
    "uplot",
    "pg",
  ],
});
