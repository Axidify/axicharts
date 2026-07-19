import type { IncomingMessage, ServerResponse } from "node:http";
import type { AxiboardWorkspaceStore } from "../persistence/store";
import { handleAuthRequest } from "./authHandlers";
import { handleOrchestratorRequest } from "./handlers";
import { handleWorkspaceRequest } from "./workspaceHandlers";

export async function handleApiRequest(
  req: IncomingMessage,
  res: ServerResponse,
  pathname: string,
  workspaceStore: AxiboardWorkspaceStore,
): Promise<boolean> {
  if (pathname.startsWith("/api/auth")) {
    return handleAuthRequest(req, res, pathname);
  }

  if (pathname.startsWith("/api/orchestrator")) {
    return handleOrchestratorRequest(req, res, pathname);
  }

  if (pathname === "/api/workspaces") {
    return handleWorkspaceRequest(req, res, pathname, workspaceStore);
  }

  return false;
}
