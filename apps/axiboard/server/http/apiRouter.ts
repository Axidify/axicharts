import type { IncomingMessage, ServerResponse } from "node:http";
import type { AxiboardFileStore } from "../persistence/fileStore";
import { handleOrchestratorRequest } from "./handlers";
import { handleWorkspaceRequest } from "./workspaceHandlers";

export async function handleApiRequest(
  req: IncomingMessage,
  res: ServerResponse,
  pathname: string,
  fileStore: AxiboardFileStore,
): Promise<boolean> {
  if (pathname.startsWith("/api/orchestrator")) {
    return handleOrchestratorRequest(req, res, pathname);
  }

  if (pathname === "/api/workspaces") {
    return handleWorkspaceRequest(req, res, pathname, fileStore);
  }

  return false;
}
