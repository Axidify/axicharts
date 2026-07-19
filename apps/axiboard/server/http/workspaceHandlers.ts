import type { IncomingMessage, ServerResponse } from "node:http";
import { resolveAuthContext } from "../auth/context";
import type { AxiboardWorkspaceStore } from "../persistence/store";
import { isWorkspaceStore } from "../persistence/validate";
import { parseJsonBody } from "./jsonBody";
import { workspaceSaveBodySchema } from "./schemas";

function sendJson(res: ServerResponse, status: number, payload: unknown): void {
  res.statusCode = status;
  res.setHeader("content-type", "application/json");
  res.end(JSON.stringify(payload));
}

export async function handleWorkspaceRequest(
  req: IncomingMessage,
  res: ServerResponse,
  pathname: string,
  store: AxiboardWorkspaceStore,
): Promise<boolean> {
  if (pathname !== "/api/workspaces") return false;

  const auth = resolveAuthContext(req);
  if (auth.enabled && !auth.authenticated) {
    sendJson(res, 401, { ok: false, error: "Authentication required" });
    return true;
  }

  if (req.method === "GET") {
    const workspace = await store.getWorkspace(auth.userId);
    sendJson(res, 200, { ok: true, store: workspace });
    return true;
  }

  if (req.method === "POST") {
    const parsed = await parseJsonBody(req, workspaceSaveBodySchema);
    if (!parsed.ok) {
      sendJson(res, 400, { ok: false, error: parsed.error });
      return true;
    }

    if (!isWorkspaceStore(parsed.data.store)) {
      sendJson(res, 400, { ok: false, error: "Invalid workspace store" });
      return true;
    }
    await store.saveWorkspace(auth.userId, parsed.data.store);
    sendJson(res, 200, { ok: true });
    return true;
  }

  sendJson(res, 405, { ok: false, error: "Method not allowed" });
  return true;
}
