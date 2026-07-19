import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import type { UserConfig } from "vite";
import { axichartsMonorepoAliases } from "../../scripts/vite-monorepo-aliases";

const appRoot = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(appRoot, "../..");

export const axiboardViteShared: UserConfig = {
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      ...(axichartsMonorepoAliases(root) as Array<{ find: string | RegExp; replacement: string }>),
      { find: "@", replacement: path.resolve(appRoot, "src") },
    ],
  },
  server: {
    port: 3000,
  },
};
