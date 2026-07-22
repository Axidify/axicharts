import { defineConfig } from "tsup";

/** Bundled CJS entry for Nest/CJS consumers — inlines charts-spec/planning (no ESM subpath require). */
export default defineConfig({
  entry: ["src/entry/tabular.ts"],
  format: ["cjs"],
  outDir: "dist/entry",
  outExtension: () => ({ js: ".cjs" }),
  platform: "node",
  bundle: true,
  splitting: false,
  dts: false,
  clean: false,
  sourcemap: true,
  treeshake: true,
  noExternal: [/^@axicharts\/charts-spec/],
});
