import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import type { UserConfig } from "vite";
import { axichartsMonorepoAliases } from "../../scripts/vite-monorepo-aliases";

const appRoot = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(appRoot, "../..");

export const axiboardViteShared: UserConfig = {
  plugins: [react()],
  resolve: {
    alias: axichartsMonorepoAliases(root),
  },
  server: {
    port: 3000,
  },
};
