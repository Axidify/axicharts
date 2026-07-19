import { defineConfig, mergeConfig } from "vite";
import { axiboardOrchestratorPlugin } from "./server/vitePlugin";
import { axiboardViteShared } from "./vite.shared";

/** Dev server — mounts /api/orchestrator/* via Vite middleware. */
export default defineConfig(
  mergeConfig(axiboardViteShared, {
    plugins: [axiboardOrchestratorPlugin()],
  }),
);
