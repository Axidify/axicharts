import type { IncomingMessage, ServerResponse } from "node:http";
import type { WorkspaceStore } from "@axicharts/charts-runtime/workspace";
import type { AxiboardFileStore } from "../persistence/fileStore";
import type { RndSession } from "../persistence/types";
import { isRndSlug, isRndSession, isWorkspaceStore } from "../persistence/validate";

async function readJsonBody<T>(req: IncomingMessage): Promise<T> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const text = Buffer.concat(chunks).toString("utf8");
  if (!text.trim()) return {} as T;
  return JSON.parse(text) as T;
}

function sendJson(res: ServerResponse, status: number, payload: unknown): void {
  res.statusCode = status;
  res.setHeader("content-type", "application/json");
  res.end(JSON.stringify(payload));
}

export async function handleWorkspaceRequest(
  req: IncomingMessage,
  res: ServerResponse,
  pathname: string,
  store: AxiboardFileStore,
): Promise<boolean> {
  if (pathname === "/api/workspaces") {
    if (req.method === "GET") {
      const workspace = await store.getWorkspace();
      sendJson(res, 200, { ok: true, store: workspace });
      return true;
    }

    if (req.method === "POST") {
      const body = await readJsonBody<{ store?: unknown }>(req);
      if (!isWorkspaceStore(body.store)) {
        sendJson(res, 400, { ok: false, error: "Invalid workspace store" });
        return true;
      }
      await store.saveWorkspace(body.store as WorkspaceStore);
      sendJson(res, 200, { ok: true });
      return true;
    }

    sendJson(res, 405, { ok: false, error: "Method not allowed" });
    return true;
  }

  const rndMatch = pathname.match(/^\/api\/rnd\/([^/]+)$/);
  if (rndMatch) {
    const slug = rndMatch[1] ?? "";
    if (!isRndSlug(slug)) {
      sendJson(res, 404, { ok: false, error: "Unknown R&D session" });
      return true;
    }

    if (req.method === "GET") {
      const session = await store.getRndSession(slug);
      sendJson(res, 200, { ok: true, session });
      return true;
    }

    if (req.method === "POST") {
      const body = await readJsonBody<{ session?: unknown }>(req);
      if (!isRndSession(body.session)) {
        sendJson(res, 400, { ok: false, error: "Invalid R&D session" });
        return true;
      }
      await store.saveRndSession(slug, body.session as RndSession);
      sendJson(res, 200, { ok: true });
      return true;
    }

    sendJson(res, 405, { ok: false, error: "Method not allowed" });
    return true;
  }

  return false;
}
