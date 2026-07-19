import type { Plugin } from "vite";
import { handleOrchestratorRequest } from "./http/handlers";

export function axiboardOrchestratorPlugin(): Plugin {
  return {
    name: "axiboard-orchestrator-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url ?? "/", "http://localhost");
        const handled = await handleOrchestratorRequest(req, res, url.pathname);
        if (!handled) next();
      });
    },
  };
}
