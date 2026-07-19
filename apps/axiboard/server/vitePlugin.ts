import type { Plugin } from "vite";
import { handleApiRequest } from "./http/apiRouter";
import { getFileStore } from "./persistence/fileStore";

export function axiboardOrchestratorPlugin(): Plugin {
  const fileStore = getFileStore();
  return {
    name: "axiboard-orchestrator-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url ?? "/", "http://localhost");
        const handled = await handleApiRequest(req, res, url.pathname, fileStore);
        if (!handled) next();
      });
    },
  };
}
