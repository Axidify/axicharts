import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { axichartsMonorepoAliases } from "../../scripts/vite-monorepo-aliases";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: axichartsMonorepoAliases(root),
  },
  server: {
    port: 3002,
  },
});
