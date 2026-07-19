import { defineConfig } from "vite";
import { axiboardViteShared } from "./vite.shared";

/** Production + CI build — no server/orchestrator imports (uPlot CSS breaks config bundle). */
export default defineConfig(axiboardViteShared);
